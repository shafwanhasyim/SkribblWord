package com.skribbl.skribbl_word.dto;

import com.skribbl.skribbl_word.model.GameDifficulty;

import java.util.UUID;

/**
 * DTO untuk menampilkan data kata ke klien
 */
public record WordResponseDTO(
    UUID id,
    String word, 
    String category, 
    GameDifficulty difficulty, 
    String imageUrl
) {}
