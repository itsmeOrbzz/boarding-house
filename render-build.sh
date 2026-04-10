#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Updating Composer..."
composer self-update

echo "Installing PHP dependencies..."
composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

echo "Applying Database Migrations..."
php artisan migrate --force

echo "Build successful!"
