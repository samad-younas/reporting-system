<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Region;
use App\Models\SecurityMapping;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // LIST ALL USERS
    // GET /api/users
    // Query params: ?search=john&role_id=2&is_active=1
    // ─────────────────────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = User::with('roles');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) =>
                $q->where('username', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%")
                  ->orWhere('display_name', 'like', "%$s%")
            );
        }

        if ($request->filled('role_id')) {
            $query->whereHas('roles', fn($q) => $q->where('roles.id', $request->role_id));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $users = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json([
            'status' => true,
            'data'   => $users->through(fn($user) => $this->formatUserSummary($user)),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET SINGLE USER
    // GET /api/users/{id}
    // Returns full profile including roles, permissions and security mappings.
    // ─────────────────────────────────────────────────────────────────────────
    public function show($id)
    {
        $user = User::with(['roles.permissions', 'securityMappings.region', 'securityMappings.productGroup', 'securityMappings.customerGroup'])
                    ->findOrFail($id);

        return response()->json(['status' => true, 'data' => $this->formatUserFull($user)]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE USER
    // POST /api/users
    // Payload:
    // {
    //   "username": "jdoe",
    //   "email": "jdoe@company.com",
    //   "display_name": "John Doe",
    //   "password": "SecurePass@1",
    //   "password_confirmation": "SecurePass@1",
    //   "auth_type": "internal",           // internal | mfa | entra_id | saml | oidc
    //   "role_ids": [2, 4],
    //   "sales_rep_id": "SR001",           // optional
    //   "visibility_flags": {              // optional
    //     "see_cost": false,
    //     "see_gp": false,
    //     "see_margin": false
    //   },
    //   "security_mappings": [             // optional — data access restrictions
    //     { "region_id": 1, "product_group_id": null, "customer_group_id": null, "is_allow": true },
    //     { "region_id": null, "product_group_id": 3, "customer_group_id": null, "is_allow": true }
    //   ]
    // }
    // ─────────────────────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'username'                         => 'required|string|unique:users,username',
            'email'                            => 'required|email|unique:users,email',
            'display_name'                     => 'nullable|string|max:100',
            'password'                         => 'required|min:8|confirmed',
            'auth_type'                        => 'sometimes|in:internal,mfa,entra_id,saml,oidc',
            'role_ids'                         => 'required|array|min:1',
            'role_ids.*'                       => 'exists:roles,id',
            'sales_rep_id'                     => 'nullable|string',
            'visibility_flags'                 => 'nullable|array',
            'security_mappings'                => 'nullable|array',
            'security_mappings.*.region_id'          => 'nullable|exists:regions,id',
            'security_mappings.*.product_group_id'   => 'nullable|exists:product_groups,id',
            'security_mappings.*.customer_group_id'  => 'nullable|exists:customer_groups,id',
            'security_mappings.*.is_allow'           => 'boolean',
        ]);

        $user = User::create([
            'username'         => $request->username,
            'email'            => $request->email,
            'display_name'     => $request->display_name,
            'password'         => Hash::make($request->password),
            'auth_type'        => $request->auth_type ?? 'internal',
            'is_mfa_enabled'   => $request->auth_type === 'mfa',
            'sales_rep_id'     => $request->sales_rep_id,
            'visibility_flags' => $request->visibility_flags ?? [
                'see_cost' => false, 'see_gp' => false, 'see_margin' => false,
            ],
            'is_active' => true,
        ]);

        // Assign roles
        $user->roles()->attach($request->role_ids);

        // Assign security mappings
        if ($request->filled('security_mappings')) {
            foreach ($request->security_mappings as $mapping) {
                SecurityMapping::create([
                    'user_id'           => $user->id,
                    'region_id'         => $mapping['region_id'] ?? null,
                    'product_group_id'  => $mapping['product_group_id'] ?? null,
                    'customer_group_id' => $mapping['customer_group_id'] ?? null,
                    'is_allow'          => $mapping['is_allow'] ?? true,
                ]);
            }
        }

        return response()->json([
            'status'  => true,
            'message' => 'User created successfully',
            'data'    => $this->formatUserFull($user->load('roles.permissions', 'securityMappings')),
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE USER
    // PUT /api/users/{id}
    // All fields optional. Password only updated if provided.
    // security_mappings: if provided, replaces all existing mappings.
    // ─────────────────────────────────────────────────────────────────────────
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'username'         => 'sometimes|string|unique:users,username,' . $id,
            'email'            => 'sometimes|email|unique:users,email,' . $id,
            'display_name'     => 'nullable|string|max:100',
            'password'         => 'sometimes|min:8|confirmed',
            'auth_type'        => 'sometimes|in:internal,mfa,entra_id,saml,oidc',
            'role_ids'         => 'sometimes|array|min:1',
            'role_ids.*'       => 'exists:roles,id',
            'sales_rep_id'     => 'nullable|string',
            'visibility_flags' => 'nullable|array',
            'is_active'        => 'sometimes|boolean',
            'security_mappings'                      => 'nullable|array',
            'security_mappings.*.region_id'          => 'nullable|exists:regions,id',
            'security_mappings.*.product_group_id'   => 'nullable|exists:product_groups,id',
            'security_mappings.*.customer_group_id'  => 'nullable|exists:customer_groups,id',
            'security_mappings.*.is_allow'           => 'boolean',
        ]);

        $data = $request->only('username', 'email', 'display_name', 'auth_type', 'sales_rep_id', 'visibility_flags', 'is_active');

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->filled('auth_type')) {
            $data['is_mfa_enabled'] = $request->auth_type === 'mfa';
        }

        $user->update($data);

        if ($request->has('role_ids')) {
            $user->roles()->sync($request->role_ids);
        }

        if ($request->has('security_mappings')) {
            // Replace all mappings
            $user->securityMappings()->delete();
            foreach ($request->security_mappings as $mapping) {
                SecurityMapping::create([
                    'user_id'           => $user->id,
                    'region_id'         => $mapping['region_id'] ?? null,
                    'product_group_id'  => $mapping['product_group_id'] ?? null,
                    'customer_group_id' => $mapping['customer_group_id'] ?? null,
                    'is_allow'          => $mapping['is_allow'] ?? true,
                ]);
            }
        }

        return response()->json([
            'status'  => true,
            'message' => 'User updated successfully',
            'data'    => $this->formatUserFull($user->fresh(['roles.permissions', 'securityMappings'])),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE USER
    // DELETE /api/users/{id}
    // ─────────────────────────────────────────────────────────────────────────
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['status' => true, 'message' => 'User deleted successfully']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TOGGLE ACTIVE STATUS
    // POST /api/users/{id}/toggle-status
    // Payload: { "is_active": true }
    // ─────────────────────────────────────────────────────────────────────────
    public function toggleStatus(Request $request, $id)
    {
        $request->validate(['is_active' => 'required|boolean']);

        $user = User::findOrFail($id);
        $user->update(['is_active' => $request->is_active]);

        return response()->json([
            'status'  => true,
            'message' => 'User status updated',
            'data'    => ['user_id' => $id, 'is_active' => $user->is_active],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET USER SECURITY MAPPINGS
    // GET /api/users/{id}/security
    // ─────────────────────────────────────────────────────────────────────────
    public function security($id)
    {
        $user = User::with([
            'securityMappings.region',
            'securityMappings.productGroup',
            'securityMappings.customerGroup',
        ])->findOrFail($id);

        return response()->json([
            'status' => true,
            'data'   => $user->securityMappings->map(fn($m) => [
                'id'              => $m->id,
                'region'          => $m->region ? ['id' => $m->region->id, 'name' => $m->region->region_name] : null,
                'product_group'   => $m->productGroup ? ['id' => $m->productGroup->id, 'name' => $m->productGroup->product_group_name] : null,
                'customer_group'  => $m->customerGroup ? ['id' => $m->customerGroup->id, 'name' => $m->customerGroup->customer_group_name] : null,
                'is_allow'        => $m->is_allow,
            ]),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private function formatUserSummary(User $user): array
    {
        return [
            'id'           => $user->id,
            'username'     => $user->username,
            'display_name' => $user->display_name,
            'email'        => $user->email,
            'is_active'    => $user->is_active,
            'auth_type'    => $user->auth_type,
            'roles'        => $user->roles->map(fn($r) => ['id' => $r->id, 'name' => $r->role_name])->values(),
            'last_login_at'=> $user->last_login_at,
        ];
    }

    private function formatUserFull(User $user): array
    {
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
            'roles'            => $user->roles->map(fn($r) => ['id' => $r->id, 'name' => $r->role_name])->values(),
            'permissions'      => $permissions,
            'security_mappings'=> $user->securityMappings->map(fn($m) => [
                'id'              => $m->id,
                'region_id'       => $m->region_id,
                'product_group_id'=> $m->product_group_id,
                'customer_group_id'=> $m->customer_group_id,
                'is_allow'        => $m->is_allow,
            ])->values(),
        ];
    }

    public function getData(Request $request)
    {
        $parentId = $request->input('parent_id');
        $type = $request->input('type'); // country, region, state, city, department, sales_rep
        
        if (!$parentId) {
            return response()->json([
                'success' => false,
                'message' => 'parent_id is required'
            ], 400);
        }
        
        if (!$type) {
            return response()->json([
                'success' => false,
                'message' => 'type is required (country, region, state, city, department, sales_rep)'
            ], 400);
        }
        
        $children = collect(); // Initialize empty collection
        
        switch ($type) {
            case 'country':
                // Give me list of countries where region_type = country
                $children = Region::where('region_type', 'country')
                    ->where('is_active', 1)
                    ->get();
                break;
                
            case 'region':
                // Give me list of regions where region_type = region AND parent_region_id = parentId
                $children = Region::where('region_type', 'region')
                    ->where('parent_region_id', $parentId)
                    ->where('is_active', 1)
                    ->get();
                break;
                
            case 'state':
                // Give me list of states where region_type = state AND parent_region_id = parentId
                $children = Region::where('region_type', 'state')
                    ->where('parent_region_id', $parentId)
                    ->where('is_active', 1)
                    ->get();
                break;
                
            case 'city':
                // Give me list of cities where region_type = city AND parent_region_id = parentId
                $children = Region::where('region_type', 'city')
                    ->where('parent_region_id', $parentId)
                    ->where('is_active', 1)
                    ->get();
                break;
                
            case 'department':
                // Give me list of departments where region_type = department AND parent_region_id = parentId
                $children = Region::where('region_type', 'department')
                    ->where('parent_region_id', $parentId)
                    ->where('is_active', 1)
                    ->get();
                break;
                
            case 'sales_rep':
                // Give me list of sales_reps where region_type = sales_rep AND parent_region_id = parentId
                $children = Region::where('region_type', 'sales_rep')
                    ->where('parent_region_id', $parentId)
                    ->where('is_active', 1)
                    ->get();
                break;
                
            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid type. Allowed types: country, region, state, city, department, sales_rep'
                ], 400);
        }
        
        return response()->json([
            'success' => true,
            'type' => $type,
            'parent_id' => $parentId,
            'data' => $children,
            'total' => $children->count()
        ]);
    }
}
