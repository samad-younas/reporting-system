<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Default system roles with their permission keys.
     * Permission keys are used by the frontend to show/hide sidebar items and features.
     *
     * Format: "module.action"
     *   - users.view         - Can see user list
     *   - users.manage       - Can create/edit/delete users
     *   - roles.manage       - Can manage roles & permissions
     *   - reports.view       - Can view reports catalogue
     *   - reports.manage     - Can upload/register reports
     *   - reports.export     - Can export report data
     *   - admin.settings     - Can access system settings
     *   - admin.audit        - Can view audit logs
     *   - admin.licences     - Can manage licences
     *   - security.manage    - Can manage security mappings
     *   - dashboard.enquiries - Can see enquiries dashboard item
     *   - dashboard.grid     - Can see grid reports dashboard item
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin',
                'description' => 'Full system access including user setup, report setup, and security configuration',
                'is_system_role' => true,
                'permissions' => [
                    'users.view', 'users.manage',
                    'roles.manage',
                    'reports.view', 'reports.manage', 'reports.export',
                    'admin.settings', 'admin.audit', 'admin.licences',
                    'security.manage',
                    'dashboard.enquiries', 'dashboard.grid',
                ],
            ],
            [
                'name' => 'Publisher',
                'description' => 'Responsible for building and publishing reports',
                'is_system_role' => true,
                'permissions' => [
                    'reports.view', 'reports.manage', 'reports.export',
                    'dashboard.enquiries', 'dashboard.grid',
                ],
            ],
            [
                'name' => 'Executive',
                'description' => 'Unrestricted access to view all reports',
                'is_system_role' => false,
                'permissions' => [
                    'reports.view', 'reports.export',
                    'dashboard.enquiries', 'dashboard.grid',
                ],
            ],
            [
                'name' => 'Regional Manager',
                'description' => 'Restricted to specific geographic regions',
                'is_system_role' => false,
                'permissions' => [
                    'reports.view', 'reports.export',
                    'dashboard.enquiries', 'dashboard.grid',
                ],
            ],
            [
                'name' => 'State Manager',
                'description' => 'Restricted to specific states',
                'is_system_role' => false,
                'permissions' => [
                    'reports.view', 'reports.export',
                    'dashboard.grid',
                ],
            ],
            [
                'name' => 'Cost Centre Manager',
                'description' => 'Restricted to assigned cost centres',
                'is_system_role' => false,
                'permissions' => [
                    'reports.view', 'reports.export',
                    'dashboard.grid',
                ],
            ],
            [
                'name' => 'Product Manager',
                'description' => 'Restricted to assigned product groups',
                'is_system_role' => false,
                'permissions' => [
                    'reports.view', 'reports.export',
                    'dashboard.grid',
                ],
            ],
            [
                'name' => 'Sales Representative',
                'description' => 'Restricted to specific customers and regions',
                'is_system_role' => false,
                'permissions' => [
                    'reports.view',
                    'dashboard.enquiries',
                ],
            ],
            [
                'name' => 'Rental Manager',
                'description' => 'Access limited to rental transaction reports',
                'is_system_role' => false,
                'permissions' => [
                    'reports.view', 'reports.export',
                    'dashboard.grid',
                ],
            ],
            [
                'name' => 'Service Manager',
                'description' => 'Access limited to service transaction reports',
                'is_system_role' => false,
                'permissions' => [
                    'reports.view', 'reports.export',
                    'dashboard.grid',
                ],
            ],
        ];

        foreach ($roles as $roleData) {
            $role = DB::table('roles')->insertGetId([
                'role_name'      => $roleData['name'],
                'description'    => $roleData['description'],
                'is_system_role' => $roleData['is_system_role'],
                'is_active'      => true,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

            foreach ($roleData['permissions'] as $permKey) {
                DB::table('role_permissions')->insert([
                    'role_id'        => $role,
                    'permission_key' => $permKey,
                    'is_allowed'     => true,
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);
            }
        }

        // Create default admin user
        $adminRoleId = DB::table('roles')->where('role_name', 'Admin')->value('id');

        $adminId = DB::table('users')->insertGetId([
            'username'         => 'admin',
            'display_name'     => 'System Administrator',
            'email'            => 'admin@system.local',
            'password'         => Hash::make('Admin@123456'),
            'auth_type'        => 'internal',
            'is_mfa_enabled'   => false,
            'is_active'        => true,
            'visibility_flags' => json_encode(['see_cost' => true, 'see_gp' => true, 'see_margin' => true]),
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        DB::table('user_roles')->insert([
            'user_id'    => $adminId,
            'role_id'    => $adminRoleId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
