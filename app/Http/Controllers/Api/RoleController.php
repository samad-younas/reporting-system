<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // LIST ALL ROLES
    // GET /api/roles
    // Returns roles with their permissions.
    // ─────────────────────────────────────────────────────────────────────────
    public function index()
    {
        $roles = Role::with('permissions')->get()->map(fn($role) => [
            'id'             => $role->id,
            'role_name'      => $role->role_name,
            'description'    => $role->description,
            'is_system_role' => $role->is_system_role,
            'is_active'      => $role->is_active,
            'permissions'    => $role->permissions->where('is_allowed', true)->pluck('permission_key')->values(),
            'user_count'     => $role->users()->count(),
        ]);

        return response()->json(['status' => true, 'data' => $roles]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET SINGLE ROLE
    // GET /api/roles/{id}
    // ─────────────────────────────────────────────────────────────────────────
    public function show($id)
    {
        $role = Role::with('permissions')->findOrFail($id);

        return response()->json([
            'status' => true,
            'data'   => [
                'id'             => $role->id,
                'role_name'      => $role->role_name,
                'description'    => $role->description,
                'is_system_role' => $role->is_system_role,
                'is_active'      => $role->is_active,
                'permissions'    => $role->permissions->where('is_allowed', true)->pluck('permission_key')->values(),
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE ROLE
    // POST /api/roles
    // Payload:
    // {
    //   "role_name": "Finance Manager",
    //   "description": "Can view financial reports",
    //   "is_system_role": false,
    //   "permissions": ["reports.view", "reports.export", "dashboard.grid"]
    // }
    // ─────────────────────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $request->validate([
            'role_name'      => 'required|string|unique:roles,role_name',
            'description'    => 'nullable|string',
            'is_system_role' => 'boolean',
            'permissions'    => 'required|array',
            'permissions.*'  => 'string',
        ]);

        $role = Role::create([
            'role_name'      => $request->role_name,
            'description'    => $request->description,
            'is_system_role' => $request->boolean('is_system_role', false),
            'is_active'      => true,
        ]);

        $this->syncPermissions($role, $request->permissions);

        return response()->json([
            'status'  => true,
            'message' => 'Role created successfully',
            'data'    => ['id' => $role->id, 'role_name' => $role->role_name],
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE ROLE
    // PUT /api/roles/{id}
    // Payload: same as store (all fields optional)
    // Note: updating permissions replaces the entire permission set.
    // ─────────────────────────────────────────────────────────────────────────
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $request->validate([
            'role_name'   => 'sometimes|string|unique:roles,role_name,' . $id,
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'string',
        ]);

        $role->update($request->only('role_name', 'description', 'is_active'));

        if ($request->has('permissions')) {
            $this->syncPermissions($role, $request->permissions);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Role updated successfully',
            'data'    => $role->fresh('permissions'),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE ROLE
    // DELETE /api/roles/{id}
    // System roles cannot be deleted.
    // ─────────────────────────────────────────────────────────────────────────
    public function destroy($id)
    {
        $role = Role::findOrFail($id);

        if ($role->is_system_role) {
            return response()->json(['status' => false, 'message' => 'System roles cannot be deleted'], 403);
        }

        if ($role->users()->exists()) {
            return response()->json(['status' => false, 'message' => 'Cannot delete a role that is assigned to users. Reassign users first.'], 409);
        }

        $role->delete();

        return response()->json(['status' => true, 'message' => 'Role deleted successfully']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET ALL AVAILABLE PERMISSION KEYS
    // GET /api/roles/permissions/available
    // Frontend uses this to build the permission checkboxes UI.
    // ─────────────────────────────────────────────────────────────────────────
    public function availablePermissions()
    {
        // Group permissions by module for the UI
        $permissions = [
            'users'     => ['users.view', 'users.manage'],
            'roles'     => ['roles.manage'],
            'reports'   => ['reports.view', 'reports.manage', 'reports.export'],
            'admin'     => ['admin.settings', 'admin.audit', 'admin.licences'],
            'security'  => ['security.manage'],
            'dashboard' => ['dashboard.enquiries', 'dashboard.grid'],
        ];

        return response()->json(['status' => true, 'data' => $permissions]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ASSIGN ROLES TO USER
    // POST /api/roles/assign-user
    // Payload:
    // {
    //   "user_id": 5,
    //   "role_ids": [1, 3],
    //   "start_date": "2024-01-01",   // optional
    //   "end_date": "2024-12-31"      // optional
    // }
    // ─────────────────────────────────────────────────────────────────────────
    public function assignToUser(Request $request)
    {
        $request->validate([
            'user_id'    => 'required|exists:users,id',
            'role_ids'   => 'required|array',
            'role_ids.*' => 'exists:roles,id',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
        ]);

        $syncData = [];
        foreach ($request->role_ids as $roleId) {
            $syncData[$roleId] = [
                'start_date' => $request->start_date,
                'end_date'   => $request->end_date,
            ];
        }

        $user = \App\Models\User::findOrFail($request->user_id);
        $user->roles()->sync($syncData);

        return response()->json([
            'status'  => true,
            'message' => 'Roles assigned successfully',
            'data'    => [
                'user_id'  => $request->user_id,
                'role_ids' => $request->role_ids,
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE: sync permissions for a role (replace all)
    // ─────────────────────────────────────────────────────────────────────────
    private function syncPermissions(Role $role, array $permissionKeys): void
    {
        // Delete existing and re-insert
        $role->permissions()->delete();

        $insert = array_map(fn($key) => [
            'role_id'        => $role->id,
            'permission_key' => $key,
            'is_allowed'     => true,
            'created_at'     => now(),
            'updated_at'     => now(),
        ], $permissionKeys);

        RolePermission::insert($insert);
    }
}
