package com.skribbl.skribbl_word.dto;

import com.skribbl.skribbl_word.model.GameMode;
import java.util.UUID;

/**
 * DTO untuk mengirim status permainan ke klien
 */
public record GameStateResponseDTO(
    String scrambledWord,
    int score,
    int streakCount,
    long timeLeftSeconds,
    boolean isCorrect,
    String correctAnswer,
    boolean isGameOver,
    UUID currentWordId,
    String category,
    String imageUrl,
    GameMode gameMode,
    int lives
) {
    // Constructor overload untuk kasus ketika permainan dalam keadaan aktif
    public GameStateResponseDTO(String scrambledWord, int score, int streakCount, 
                              long timeLeftSeconds, boolean isCorrect, UUID currentWordId,
                              String category, String imageUrl) {
        this(scrambledWord, score, streakCount, timeLeftSeconds, isCorrect, null, false, currentWordId, category, imageUrl, GameMode.TIME_ATTACK, 0);
    }
    
    // Constructor overload untuk kasus jawaban salah
    public GameStateResponseDTO(String scrambledWord, int score, int streakCount, 
                              long timeLeftSeconds, boolean isCorrect, String correctAnswer, 
                              UUID currentWordId, String category, String imageUrl) {
        this(scrambledWord, score, streakCount, timeLeftSeconds, isCorrect, correctAnswer, false, 
             currentWordId, category, imageUrl, GameMode.TIME_ATTACK, 0);
    }
      // Constructor overload untuk kasus game over
    public static GameStateResponseDTO gameOver(int finalScore, GameMode gameMode, int lives) {
        return new GameStateResponseDTO(null, finalScore, 0, 0, false, null, true, null, null, null, gameMode, lives);
    }
    
    // Constructor overload untuk kasus game over (backward compatibility)
    public static GameStateResponseDTO gameOver(int finalScore) {
        return gameOver(finalScore, GameMode.TIME_ATTACK, 0);
    }
}
