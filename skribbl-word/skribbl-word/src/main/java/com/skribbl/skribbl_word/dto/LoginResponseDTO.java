package com.skribbl.skribbl_word.dto;

import java.util.UUID;

/**
 * DTO untuk mengirim hasil login ke client
 */
public record LoginResponseDTO(
    UUID id,
    String username,
    String token
) {}
