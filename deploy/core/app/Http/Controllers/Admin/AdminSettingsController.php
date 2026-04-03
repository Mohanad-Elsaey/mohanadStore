<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    /**
     * Get all system settings.
     */
    public function index()
    {
        // For now, return default settings. 
        // In a real app, these would come from a 'settings' table or config files.
        return response()->json([
            'data' => [
                'site_name' => 'Mohaned E-commerce',
                'contact_email' => 'support@mohaned-store.com',
                'currency' => 'USD',
                'maintenance_mode' => false,
                'allow_registration' => true,
                'security_neural_proxy' => true,
                'quantum_auth_token' => false
            ]
        ]);
    }

    /**
     * Update system settings.
     */
    public function update(Request $request)
    {
        // For now, just return success since we aren't persisting to a DB yet.
        return response()->json([
            'message' => 'System configuration synchronized successfully.',
            'data' => $request->all()
        ]);
    }
}
