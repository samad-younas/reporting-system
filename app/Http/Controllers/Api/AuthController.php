<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // REGISTER (Admin creates users — public self-registration is disabled)
    // POST /api/auth/register
    // ─────────────────────────────────────────────────────────────────────────
    public function register(Request $request)
    {
        $request->validate([
            'username'         => 'required|string|unique:users,username',
            'email'            => 'required|email|unique:users,email',
            'display_name'     => 'nullable|string|max:100',
            'password'         => 'required|min:8|confirmed',
            'auth_type'        => 'sometimes|in:internal,mfa,entra_id,saml,oidc',
            'role_ids'         => 'required|array',
            'role_ids.*'       => 'exists:roles,id',
            'sales_rep_id'     => 'nullable|string',
            'visibility_flags' => 'nullable|array',
        ]);

        $user = User::create([
            'username'         => $request->username,
            'email'            => $request->email,
            'display_name'     => $request->display_name,
            'password'         => Hash::make($request->password),
            'auth_type'        => $request->auth_type ?? 'internal',
            'is_mfa_enabled'   => in_array($request->auth_type, ['mfa']),
            'sales_rep_id'     => $request->sales_rep_id,
            'visibility_flags' => $request->visibility_flags ?? ['see_cost' => false, 'see_gp' => false, 'see_margin' => false],
            'is_active'        => true,
        ]);

        // Attach roles
        $user->roles()->attach($request->role_ids);

        $this->writeAuditLog($user->id, 'admin_change', [
            'action'   => 'user_created',
            'by'       => auth()->id(),
        ], $request);

        return response()->json([
            'status'  => true,
            'message' => 'User created successfully',
            'data'    => $this->formatUser($user),
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOGIN (Step 1 — credential check)
    // POST /api/auth/login
    // Payload: { "email": "...", "password": "..." }
    // ─────────────────────────────────────────────────────────────────────────
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Credential check
        if (!$user || !Hash::check($request->password, $user->password)) {
            $this->writeAuditLog(
                $user?->id,
                'login_failed',
                ['email' => $request->email, 'reason' => 'bad_credentials'],
                $request
            );
            return response()->json(['status' => false, 'message' => 'Invalid credentials'], 401);
        }

        // Active check
        if (!$user->is_active) {
            return response()->json(['status' => false, 'message' => 'Account is inactive. Contact your administrator.'], 403);
        }

        // MFA required — return a short-lived challenge token instead of a full session token
        if ($user->is_mfa_enabled && $user->mfa_confirmed) {
            $challengeToken = $user->createToken('mfa_challenge', ['mfa-pending'], now()->addMinutes(5))->plainTextToken;

            return response()->json([
                'status'          => true,
                'mfa_required'    => true,
                'mfa_challenge_token' => $challengeToken,
                'message'         => 'MFA verification required',
            ]);
        }

        return $this->issueFullToken($user, $request);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MFA VERIFY (Step 2 — TOTP code check)
    // POST /api/auth/mfa/verify
    // Payload: { "code": "123456" }
    // Header:  Authorization: Bearer <mfa_challenge_token>
    // ─────────────────────────────────────────────────────────────────────────
    public function mfaVerify(Request $request)
    {
        $request->validate(['code' => 'required|string|size:6']);

        $user = $request->user();

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        // Ensure they're using the challenge token (not a full token)
        if (!$request->user()->currentAccessToken()->cant('mfa-pending')) {
            // Token has full abilities — MFA already completed or not required
            return response()->json(['status' => false, 'message' => 'Invalid token for MFA verification'], 400);
        }

        $google2fa = new Google2FA();
        $valid = $google2fa->verifyKey($user->mfa_secret, $request->code);

        if (!$valid) {
            $this->writeAuditLog($user->id, 'mfa_verify', ['success' => false], $request);
            return response()->json(['status' => false, 'message' => 'Invalid or expired MFA code'], 401);
        }

        // Revoke the challenge token and issue a real one
        $user->currentAccessToken()->delete();
        $this->writeAuditLog($user->id, 'mfa_verify', ['success' => true], $request);

        return $this->issueFullToken($user, $request);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MFA SETUP — Generate QR/secret for a user
    // POST /api/auth/mfa/setup
    // Requires: auth:sanctum
    // ─────────────────────────────────────────────────────────────────────────
    public function mfaSetup(Request $request)
    {
        $user = $request->user();
        $google2fa = new Google2FA();

        $secret = $google2fa->generateSecretKey();
        $user->mfa_secret    = $secret; // Will be encrypted at rest via DB encryption if configured
        $user->mfa_confirmed = false;
        $user->save();

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        $this->writeAuditLog($user->id, 'mfa_setup', ['step' => 'secret_generated'], $request);

        return response()->json([
            'status'    => true,
            'secret'    => $secret,
            'qr_url'    => $qrCodeUrl,
            'message'   => 'Scan the QR code with your authenticator app, then confirm with /api/auth/mfa/confirm',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MFA CONFIRM — User confirms they scanned the QR correctly
    // POST /api/auth/mfa/confirm
    // Payload: { "code": "123456" }
    // Requires: auth:sanctum
    // ─────────────────────────────────────────────────────────────────────────
    public function mfaConfirm(Request $request)
    {
        $request->validate(['code' => 'required|string|size:6']);

        $user = $request->user();
        $google2fa = new Google2FA();

        if (!$google2fa->verifyKey($user->mfa_secret, $request->code)) {
            return response()->json(['status' => false, 'message' => 'Invalid code. Please try again.'], 422);
        }

        $user->mfa_confirmed  = true;
        $user->is_mfa_enabled = true;
        $user->save();

        $this->writeAuditLog($user->id, 'mfa_setup', ['step' => 'confirmed'], $request);

        return response()->json(['status' => true, 'message' => 'MFA has been enabled successfully']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MFA DISABLE
    // POST /api/auth/mfa/disable
    // Payload: { "password": "current_password" }
    // Requires: auth:sanctum
    // ─────────────────────────────────────────────────────────────────────────
    public function mfaDisable(Request $request)
    {
        $request->validate(['password' => 'required']);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['status' => false, 'message' => 'Incorrect password'], 401);
        }

        $user->is_mfa_enabled = false;
        $user->mfa_confirmed  = false;
        $user->mfa_secret     = null;
        $user->save();

        $this->writeAuditLog($user->id, 'mfa_setup', ['step' => 'disabled'], $request);

        return response()->json(['status' => true, 'message' => 'MFA has been disabled']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET CURRENT USER (me)
    // GET /api/auth/me
    // Requires: auth:sanctum
    // ─────────────────────────────────────────────────────────────────────────
    public function me(Request $request)
    {
        return response()->json([
            'status' => true,
            'data'   => $this->formatUser($request->user()),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOGOUT
    // POST /api/auth/logout
    // Requires: auth:sanctum
    // ─────────────────────────────────────────────────────────────────────────
    public function logout(Request $request)
    {
        $userId = $request->user()->id;
        $request->user()->currentAccessToken()->delete();

        $this->writeAuditLog($userId, 'logout', [], $request);

        return response()->json(['status' => true, 'message' => 'Logged out successfully']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Issue a full-access Sanctum token and return the standard login response.
     */
    private function issueFullToken(User $user, Request $request): \Illuminate\Http\JsonResponse
    {
        $token = $user->createToken('auth_token')->plainTextToken;

        $user->last_login_at = now();
        $user->save();

        $this->writeAuditLog($user->id, 'login', ['auth_type' => $user->auth_type], $request);

        return response()->json([
            'status'       => true,
            'mfa_required' => false,
            'token'        => $token,
            'user'         => $this->formatUser($user),
        ]);
    }

    /**
     * Format user data for API response.
     * This is the shape the frontend receives on every login / me call.
     * The frontend uses `roles` and `permissions` to drive sidebar and access control.
     */
    private function formatUser(User $user): array
    {
        $user->load('roles.permissions');

        $roles = $user->roles->map(fn($role) => [
            'id'   => $role->id,
            'name' => $role->role_name,
        ])->values();

        // Merge all permissions from all roles (deduplicated)
        $permissions = $user->roles
            ->flatMap(fn($role) => $role->permissions->where('is_allowed', true)->pluck('permission_key'))
            ->unique()
            ->values();

        return [
            'id'               => $user->id,
            'username'         => $user->username,
            'display_name'     => $user->display_name,
            'email'            => $user->email,
            'auth_type'        => $user->auth_type,
            'is_mfa_enabled'   => $user->is_mfa_enabled,
            'is_active'        => $user->is_active,
            'sales_rep_id'     => $user->sales_rep_id,
            'visibility_flags' => $user->visibility_flags,
            'last_login_at'    => $user->last_login_at,
            'roles'            => $roles,
            'permissions'      => $permissions, // e.g. ["reports.view","users.manage","admin.settings"]
        ];
    }

    /**
     * Write to audit log.
     */
    private function writeAuditLog(?int $userId, string $actionType, array $detail, Request $request): void
    {
        AuditLog::create([
            'user_id'       => $userId,
            'action_type'   => $actionType,
            'action_detail' => $detail,
            'ip_address'    => $request->ip(),
            'user_agent'    => $request->userAgent(),
        ]);
    }
}
