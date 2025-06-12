package com.skribbl.skribbl_word.dto;

/**
 * DTO untuk menerima permintaan pembaruan profil dari client
 */
public record UpdateProfileRequestDTO(
    String email
) {}
