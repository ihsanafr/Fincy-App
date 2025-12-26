<?php

/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode backend.
 * Manfaat: Menjaga logika server tetap terstruktur dan mudah dirawat.
 */

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['message' => 'Fincy API'];
});


