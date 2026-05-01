<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Auto-create storage symlink if it doesn't exist or is broken.
        // On Windows, junctions are used instead of symlinks (no admin needed).
        // The /storage/{path} route in web.php is the primary fallback,
        // but the symlink improves performance by serving files directly via the web server.
        $storageLinkPath = public_path('storage');
        $storageTargetPath = storage_path('app/public');

        $needsLink = false;

        if (!file_exists($storageLinkPath)) {
            // Path doesn't exist at all — we need to create the link
            $needsLink = true;
        } elseif (is_link($storageLinkPath)) {
            // It's a symlink — check if it's valid (not broken)
            $target = @readlink($storageLinkPath);
            if (!$target || !is_dir($target)) {
                @unlink($storageLinkPath);
                $needsLink = true;
            }
        } elseif (is_dir($storageLinkPath)) {
            // It's a real directory or junction — verify it actually contains our files
            // by checking if the categories/products subdirs are accessible
            $testDir = $storageLinkPath . DIRECTORY_SEPARATOR . 'products';
            if (!is_dir($testDir) && is_dir($storageTargetPath . DIRECTORY_SEPARATOR . 'products')) {
                // Junction is broken, remove and recreate
                if (PHP_OS_FAMILY === 'Windows') {
                    @exec('rmdir "' . $storageLinkPath . '"');
                } else {
                    @unlink($storageLinkPath);
                }
                $needsLink = true;
            }
        }

        if ($needsLink) {
            if (PHP_OS_FAMILY === 'Windows') {
                // Use mklink /J for directory junction (no admin privileges needed)
                @exec('mklink /J "' . $storageLinkPath . '" "' . $storageTargetPath . '"');
            } else {
                @symlink($storageTargetPath, $storageLinkPath);
            }
        }
    }
}
