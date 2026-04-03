<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * List all users (for admin table).
     */
    public function index(Request $request)
    {
        $query = User::withCount('orders');

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%')
                ->orWhere('phone', 'like', '%' . $request->search . '%');
        }
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        return UserResource::collection($query->paginate(20));
    }

    /**
     * Show single user detail + order summary.
     */
    public function show($id)
    {
        $user = User::with(['orders.items.product'])
            ->withCount('orders')
            ->findOrFail($id);

        return new UserResource($user);
    }

    /**
     * Ban user.
     */
    public function ban($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admin cannot be banned.'], 403);
        }

        $user->update(['is_banned' => true]);

        return new UserResource($user);
    }

    /**
     * Unban user.
     */
    public function unban($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_banned' => false]);

        return new UserResource($user);
    }

    /**
     * Delete user/customer record.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admin cannot be deleted.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Toggle user role.
     */
    public function toggleRole($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot change your own role.'], 403);
        }

        $user->update([
            'role' => $user->role === 'admin' ? 'customer' : 'admin'
        ]);

        return new UserResource($user);
    }
}
