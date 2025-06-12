package com.skribbl.skribbl_word.dto;

import com.skribbl.skribbl_word.model.GameDifficulty;
import com.skribbl.skribbl_word.model.GameMode;

/**
 * DTO untuk menerima permintaan memulai game baru
 */
public record StartGameRequestDTO(
    GameDifficulty difficulty,
    GameMode gameMode
) {
    /**
     * Constructor dengan default game mode TIME_ATTACK
     * 
     * @param difficulty tingkat kesulitan permainan
     */
    public StartGameRequestDTO(GameDifficulty difficulty) {
        this(difficulty, GameMode.TIME_ATTACK);
    }
}
