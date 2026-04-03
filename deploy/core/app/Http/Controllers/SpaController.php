<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SpaController extends Controller
{
    /**
     * Serve the React application.
     */
    public function index()
    {
        return view('app');
    }
}
