package com.skribbl.skribbl_word.dto;

import com.skribbl.skribbl_word.model.GameDifficulty;

/**
 * DTO untuk menerima permintaan pembuatan kata baru
 */
public record CreateWordRequestDTO(
    String word, 
    String category, 
    GameDifficulty difficulty, 
    String imageUrl
) {}
