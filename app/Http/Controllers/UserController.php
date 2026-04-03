<?php

namespace App\Http\Controllers;

use App\Models\RolesPermissions;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();

        return response()->json([
            'status' => true,
            'message' => 'Users retrieved successfully',
            'data' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'user_type' => 'required',
            'role_id' => 'required|integer',
            'profile' => 'nullable|array',
        ]);

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_type' => $request->user_type,
            'role_id' => $request->role_id,
            'profile' => $request->profile,
        ]);

        $rolePermissions = RolesPermissions::where('roles', $user->user_type)->first();
        $permissions = $rolePermissions ? json_decode($rolePermissions->permissions) : [];

        return response()->json([
            'status' => true,
            'message' => 'User created successfully',
            'data' => $user,
            'permissions' => $permissions,
        ], 200);
    }


    public function show($id)
    {
        $user = User::findOrFail($id);

        return response()->json([
            'status' => true,
            'message' => 'User retrieved successfully',
            'data' => $user
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|min:6',
            'user_type' => 'sometimes|required',
            // 'location' => 'sometimes|required',
            'role_id' => 'sometimes|required|integer',
            'profile' => 'sometimes|array',
        ]);

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->update($request->only('email', 'user_type', 'role_id', 'profile'));

        return response()->json([
            'status' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'status' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'is_inactive' => 'required|boolean',
        ]);
    
        $user = User::findOrFail($id);  
    
        $profile = $user->profile ?? [];
        $profile['is_inactive'] = $request->is_inactive;
    
        $user->profile = $profile;
        $user->save();
    
        return response()->json([
            'message' => 'User status updated successfully',
            'is_inactive' => $profile['is_inactive'],
        ]);
    }
    
    
}
