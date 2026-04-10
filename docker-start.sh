#!/bin/bash

# Ensure we have our application structure ready
echo "Running Database Migrations..."
php artisan migrate --force

echo "Booting up Apache..."
apache2-foreground
