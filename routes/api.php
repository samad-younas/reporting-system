<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SecurityController;

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES (no auth required)
// ─────────────────────────────────────────────────────────────────────────────

Route::prefix('auth')->group(function () {
    // POST /api/auth/login
    // Payload: { "email": "...", "password": "..." }
    // Response: { token, user } OR { mfa_required: true, mfa_challenge_token }
    Route::post('/login', [AuthController::class, 'login']);
});

// ─────────────────────────────────────────────────────────────────────────────
// MFA ROUTES (requires sanctum auth — challenge token OR full token)
// ─────────────────────────────────────────────────────────────────────────────

Route::prefix('auth')->middleware('auth:sanctum')->group(function () {
    // POST /api/auth/mfa/verify
    // Used after login when mfa_required=true. Header: mfa_challenge_token
    // Payload: { "code": "123456" }
    Route::post('/mfa/verify', [AuthController::class, 'mfaVerify']);

    // POST /api/auth/mfa/setup   — generates QR/secret for user
    Route::post('/mfa/setup', [AuthController::class, 'mfaSetup']);

    // POST /api/auth/mfa/confirm — user confirms TOTP works after scanning
    // Payload: { "code": "123456" }
    Route::post('/mfa/confirm', [AuthController::class, 'mfaConfirm']);

    // POST /api/auth/mfa/disable
    // Payload: { "password": "current_password" }
    Route::post('/mfa/disable', [AuthController::class, 'mfaDisable']);

    // GET  /api/auth/me     — current user with roles + permissions
    Route::get('/me', [AuthController::class, 'me']);

    // POST /api/auth/logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // POST /api/auth/register (admin-only — protected by permission middleware below too)
    Route::post('/register', [AuthController::class, 'register'])->middleware('permission:users.manage');
});

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTES (full sanctum token required)
// ─────────────────────────────────────────────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    // ── ROLES ──────────────────────────────────────────────────────────────
    Route::prefix('roles')->group(function () {
        // GET  /api/roles                        — list all roles (needs users.view)
        Route::get('/', [RoleController::class, 'index'])->middleware('permission:users.view');

        // GET  /api/roles/permissions/available  — get all permission keys grouped by module
        Route::get('/permissions/available', [RoleController::class, 'availablePermissions'])->middleware('permission:roles.manage');

        // GET  /api/roles/{id}
        Route::get('/{id}', [RoleController::class, 'show'])->middleware('permission:users.view');

        // POST /api/roles                        — create role
        Route::post('/', [RoleController::class, 'store'])->middleware('permission:roles.manage');

        // PUT  /api/roles/{id}                   — update role + permissions
        Route::put('/{id}', [RoleController::class, 'update'])->middleware('permission:roles.manage');

        // DELETE /api/roles/{id}
        Route::delete('/{id}', [RoleController::class, 'destroy'])->middleware('permission:roles.manage');

        // POST /api/roles/assign-user            — assign roles to a user
        Route::post('/assign-user', [RoleController::class, 'assignToUser'])->middleware('permission:users.manage');
    });

    // ── USERS ──────────────────────────────────────────────────────────────
    Route::prefix('users')->group(function () {
        // GET  /api/users                        — list users (search, filter)
        Route::get('/', [UserController::class, 'index'])->middleware('permission:users.view');

        // GET  /api/users/{id}                   — single user (full profile)
        Route::get('/{id}', [UserController::class, 'show'])->middleware('permission:users.view');

        // POST /api/users                        — create user
        Route::post('/', [UserController::class, 'store'])->middleware('permission:users.manage');

        // PUT  /api/users/{id}                   — update user
        Route::put('/{id}', [UserController::class, 'update'])->middleware('permission:users.manage');

        // DELETE /api/users/{id}
        Route::delete('/{id}', [UserController::class, 'destroy'])->middleware('permission:users.manage');

        Route::get('/get-data', [UserController::class, 'getData']);

        // POST /api/users/{id}/toggle-status
        // Payload: { "is_active": true }
        Route::post('/{id}/toggle-status', [UserController::class, 'toggleStatus'])->middleware('permission:users.manage');

        // GET  /api/users/{id}/security          — get user security mappings
        Route::get('/{id}/security', [UserController::class, 'security'])->middleware('permission:security.manage');
    });

    // ── SECURITY (Regions, Product Groups, Customer Groups, Mappings) ──────
    Route::prefix('security')->middleware('permission:security.manage')->group(function () {

        // Regions
        // GET  /api/security/regions             — hierarchical tree
        Route::get('/regions', [SecurityController::class, 'regions']);
        // GET  /api/security/regions/flat        — flat list for dropdowns
        Route::get('/regions/flat', [SecurityController::class, 'regionsFlat']);
        // POST /api/security/regions
        // Payload: { "region_name": "Victoria", "parent_region_id": 1, "region_type": "state" }
        Route::post('/regions', [SecurityController::class, 'storeRegion']);
        // PUT  /api/security/regions/{id}
        Route::put('/regions/{id}', [SecurityController::class, 'updateRegion']);
        // DELETE /api/security/regions/{id}
        Route::delete('/regions/{id}', [SecurityController::class, 'destroyRegion']);

        // Product Groups
        // GET  /api/security/product-groups
        Route::get('/product-groups', [SecurityController::class, 'productGroups']);
        // POST /api/security/product-groups
        // Payload: { "product_group_name": "Heavy Equipment" }
        Route::post('/product-groups', [SecurityController::class, 'storeProductGroup']);
        // PUT  /api/security/product-groups/{id}
        Route::put('/product-groups/{id}', [SecurityController::class, 'updateProductGroup']);
        // DELETE /api/security/product-groups/{id}
        Route::delete('/product-groups/{id}', [SecurityController::class, 'destroyProductGroup']);

        // Customer Groups
        // GET  /api/security/customer-groups
        Route::get('/customer-groups', [SecurityController::class, 'customerGroups']);
        // POST /api/security/customer-groups
        // Payload: { "customer_group_name": "VIP Clients" }
        Route::post('/customer-groups', [SecurityController::class, 'storeCustomerGroup']);
        // PUT  /api/security/customer-groups/{id}
        Route::put('/customer-groups/{id}', [SecurityController::class, 'updateCustomerGroup']);
        // DELETE /api/security/customer-groups/{id}
        Route::delete('/customer-groups/{id}', [SecurityController::class, 'destroyCustomerGroup']);

        // Security Mappings (user ↔ region/productGroup/customerGroup)
        // GET  /api/security/mappings?user_id=5
        Route::get('/mappings', [SecurityController::class, 'mappings']);
        // POST /api/security/mappings
        // Payload: { "user_id": 5, "region_id": 2, "product_group_id": null, "customer_group_id": null, "is_allow": true }
        Route::post('/mappings', [SecurityController::class, 'storeMapping']);
        // DELETE /api/security/mappings/{id}
        Route::delete('/mappings/{id}', [SecurityController::class, 'destroyMapping']);
        // POST /api/security/mappings/bulk       — replace ALL mappings for a user
        // Payload: { "user_id": 5, "mappings": [...] }
        Route::post('/mappings/bulk', [SecurityController::class, 'bulkReplaceMappings']);

        // Buddies
        // GET  /api/security/buddies?user_id=5
        Route::get('/buddies', [SecurityController::class, 'buddies']);
        // POST /api/security/buddies
        // Payload: { "user_id": 5, "buddy_user_id": 8 }
        Route::post('/buddies', [SecurityController::class, 'storeBuddy']);
        // DELETE /api/security/buddies/{id}
        Route::delete('/buddies/{id}', [SecurityController::class, 'destroyBuddy']);
    });
});
