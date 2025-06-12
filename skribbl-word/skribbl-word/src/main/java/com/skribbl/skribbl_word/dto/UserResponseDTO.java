package com.skribbl.skribbl_word.dto;

import java.util.UUID;

/**
 * DTO untuk mengirimkan data pengguna ke client tanpa data sensitif
 */
public record UserResponseDTO(
    UUID id,
    String username,
    String email
) {}
