<?php

use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

/**
 * All normal web routes should serve the React SPA
 */
Route::get('/{any}', [SpaController::class, 'index'])->where('any', '.*');
Route::get('/', [SpaController::class, 'index']);
