package com.skribbl.skribbl_word.dto;

/**
 * DTO untuk menerima permintaan login dari client
 */
public record LoginRequestDTO(
    String username,
    String password
) {}
