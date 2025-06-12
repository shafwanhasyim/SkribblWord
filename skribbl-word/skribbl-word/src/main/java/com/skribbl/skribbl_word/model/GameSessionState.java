package com.skribbl.skribbl_word.model;

import java.io.Serializable;
import java.util.UUID;

/**
 * Model untuk menyimpan status permainan dalam sesi HTTP
 * Menerapkan Serializable agar dapat disimpan dalam HttpSession
 */
public class GameSessionState implements Serializable {
    private static final long serialVersionUID = 1L;    private UUID currentWordId;
    private String originalWord;
    private String scrambledWord;
    private String category;
    private String imageUrl;
    private GameDifficulty difficulty;
    private GameMode gameMode;
    private int score;
    private int streakCount;
    private long endTimeMillis;
    private int lives; // Jumlah nyawa untuk mode survival
    private transient Word currentWord; // Referensi ke objek Word saat ini, tidak diserialisasi
    
    // Constructor
    public GameSessionState() {
    }
    
    // Getters dan setters
    public UUID getCurrentWordId() {
        return currentWordId;
    }
    
    public void setCurrentWordId(UUID currentWordId) {
        this.currentWordId = currentWordId;
    }
    
    public String getOriginalWord() {
        return originalWord;
    }
    
    public void setOriginalWord(String originalWord) {
        this.originalWord = originalWord;
    }
    
    public String getScrambledWord() {
        return scrambledWord;
    }
    
    public void setScrambledWord(String scrambledWord) {
        this.scrambledWord = scrambledWord;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
      public GameDifficulty getDifficulty() {
        return difficulty;
    }
    
    public void setDifficulty(GameDifficulty difficulty) {
        this.difficulty = difficulty;
    }
    
    public GameMode getGameMode() {
        return gameMode;
    }
    
    public void setGameMode(GameMode gameMode) {
        this.gameMode = gameMode;
    }
    
    public int getScore() {
        return score;
    }
    
    public void setScore(int score) {
        this.score = score;
    }
    
    public int getStreakCount() {
        return streakCount;
    }
    
    public void setStreakCount(int streakCount) {
        this.streakCount = streakCount;
    }
    
    public long getEndTimeMillis() {
        return endTimeMillis;
    }
    
    public void setEndTimeMillis(long endTimeMillis) {
        this.endTimeMillis = endTimeMillis;
    }
    
    public int getLives() {
        return lives;
    }
    
    public void setLives(int lives) {
        this.lives = lives;
    }
    
    /**
     * Mengurangi jumlah nyawa dalam mode survival
     * @return jumlah nyawa yang tersisa
     */
    public int reduceLives() {
        return --lives;
    }
    
    /**
     * Mendapatkan objek Word saat ini
     * 
     * @return objek Word yang sedang dimainkan
     */
    public Word getCurrentWord() {
        return currentWord;
    }
    
    /**
     * Menetapkan objek Word saat ini
     * 
     * @param currentWord objek Word yang akan dimainkan
     */
    public void setCurrentWord(Word currentWord) {
        this.currentWord = currentWord;
    }
    
    /**
     * Memeriksa apakah waktu permainan sudah habis
     * Untuk mode SURVIVAL, selalu mengembalikan false karena tidak ada batas waktu
     * 
     * @return true jika waktu sudah habis, false jika belum
     */
    public boolean isTimeUp() {
        if (this.gameMode == GameMode.SURVIVAL) {
            return false; // Mode SURVIVAL tidak memiliki batas waktu
        }
        return System.currentTimeMillis() >= endTimeMillis;
    }
    
    /**
     * Menghitung sisa waktu dalam detik
     * Untuk mode SURVIVAL, mengembalikan nilai yang sangat besar karena tidak ada batas waktu
     * 
     * @return sisa waktu dalam detik
     */
    public long getTimeLeftSeconds() {
        if (this.gameMode == GameMode.SURVIVAL) {
            return 999999; // Nilai yang menunjukkan waktu tak terbatas untuk mode SURVIVAL
        }
        long timeLeft = endTimeMillis - System.currentTimeMillis();
        return Math.max(0, timeLeft / 1000);
    }
}
