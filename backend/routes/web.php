<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\SpaController;

/*
|--------------------------------------------------------------------------
| Storage File Server Route
|--------------------------------------------------------------------------
| This route serves uploaded files (images, etc.) directly from storage.
| It MUST be defined before the SPA catch-all route so that file requests
| are handled properly and not swallowed by the SPA controller.
|
| This eliminates the need for the `php artisan storage:link` symlink,
| which is unreliable on Windows.
*/
Route::get('/storage/{path}', function (string $path) {
    $disk = Storage::disk('public');

    if (!$disk->exists($path)) {
        abort(404);
    }

    $file = $disk->get($path);
    $mimeType = $disk->mimeType($path);
    $lastModified = $disk->lastModified($path);
    $etag = md5($lastModified . $path);

    // Return cached response if browser already has the file
    $requestEtag = request()->header('If-None-Match');
    if ($requestEtag && $requestEtag === '"' . $etag . '"') {
        return response('', 304);
    }

    return response($file, 200)
        ->header('Content-Type', $mimeType)
        ->header('Cache-Control', 'public, max-age=31536000, immutable')
        ->header('ETag', '"' . $etag . '"');
})->where('path', '.*');

/**
 * All normal web routes should serve the React SPA
 */
Route::get('/{any}', [SpaController::class, 'index'])->where('any', '.*');
Route::get('/', [SpaController::class, 'index']);
