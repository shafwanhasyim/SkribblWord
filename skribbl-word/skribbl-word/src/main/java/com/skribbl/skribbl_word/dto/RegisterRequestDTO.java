package com.skribbl.skribbl_word.dto;

/**
 * Data Transfer Object untuk menerima data registrasi dari client
 * Menggunakan Java Record untuk mendapatkan immutability dan keringkasan kode
 */
public record RegisterRequestDTO(String username, String email, String password) {
}
