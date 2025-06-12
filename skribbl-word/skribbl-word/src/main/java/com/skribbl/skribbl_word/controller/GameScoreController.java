package com.skribbl.skribbl_word.controller;

import com.skribbl.skribbl_word.model.GameDifficulty;
import com.skribbl.skribbl_word.model.GameMode;
import com.skribbl.skribbl_word.model.GameScore;
import com.skribbl.skribbl_word.model.User;
import com.skribbl.skribbl_word.repository.GameScoreRepository;
import com.skribbl.skribbl_word.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller untuk mengelola skor permainan dan leaderboard
 */
@RestController
@RequestMapping("/api/scores")
public class GameScoreController {
    
    private final GameScoreRepository gameScoreRepository;
    private final UserService userService;
    
    /**
     * Constructor untuk Dependency Injection
     * 
     * @param gameScoreRepository repository untuk akses data GameScore
     * @param userService service untuk mengakses data User
     */
    @Autowired
    public GameScoreController(GameScoreRepository gameScoreRepository, UserService userService) {
        this.gameScoreRepository = gameScoreRepository;
        this.userService = userService;
    }
    
    /**
     * Endpoint untuk mendapatkan skor tertinggi pengguna yang sedang login
     * 
     * @return daftar skor tertinggi pengguna
     */
    @GetMapping("/my-scores")
    public ResponseEntity<List<Map<String, Object>>> getMyScores() {
        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userService.getUserByUsername(username);
        
        // Get scores for this user
        List<GameScore> scores = gameScoreRepository.findByUserOrderByScoreDesc(user);
        
        // Convert to simplified format
        List<Map<String, Object>> simplifiedScores = formatScores(scores);
        
        return ResponseEntity.ok(simplifiedScores);
    }
    
    /**
     * Endpoint untuk mendapatkan leaderboard (10 skor tertinggi)
     * 
     * @return daftar 10 skor tertinggi dari semua pemain
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard() {
        List<GameScore> topScores = gameScoreRepository.findTop10ByOrderByScoreDesc();
        
        // Convert to simplified format
        List<Map<String, Object>> leaderboard = formatScores(topScores);
        
        return ResponseEntity.ok(leaderboard);
    }
    
    /**
     * Endpoint untuk mendapatkan leaderboard berdasarkan tingkat kesulitan
     * 
     * @param difficulty tingkat kesulitan yang ingin ditampilkan leaderboardnya
     * @return daftar 10 skor tertinggi untuk tingkat kesulitan tertentu
     */
    @GetMapping("/leaderboard/{difficulty}")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboardByDifficulty(
            @PathVariable GameDifficulty difficulty) {
            
        List<GameScore> filteredScores = gameScoreRepository.findTop10ByDifficultyOrderByScoreDesc(difficulty);
        
        // Convert to simplified format
        List<Map<String, Object>> leaderboard = formatScores(filteredScores);
        
        return ResponseEntity.ok(leaderboard);
    }
    
    /**
     * Endpoint untuk mendapatkan leaderboard berdasarkan mode permainan dan tingkat kesulitan
     * 
     * @param gameMode mode permainan yang ingin ditampilkan leaderboardnya
     * @param difficulty tingkat kesulitan yang ingin ditampilkan leaderboardnya
     * @return daftar 10 skor tertinggi untuk mode dan tingkat kesulitan tersebut
     */
    @GetMapping("/leaderboard/mode/{gameMode}/difficulty/{difficulty}")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboardByModeAndDifficulty(
            @PathVariable GameMode gameMode,
            @PathVariable GameDifficulty difficulty) {
        
        List<GameScore> scores = gameScoreRepository.findTop10ByGameModeAndDifficultyOrderByScoreDesc(gameMode, difficulty);
        
        // Convert to simplified format
        List<Map<String, Object>> leaderboard = formatScores(scores);
        
        return ResponseEntity.ok(leaderboard);
    }
    
    /**
     * Endpoint untuk mendapatkan skor berdasarkan mode permainan
     * 
     * @param gameMode mode permainan yang ingin ditampilkan skornya
     * @return daftar skor untuk mode permainan tersebut
     */
    @GetMapping("/by-mode/{gameMode}")
    public ResponseEntity<List<Map<String, Object>>> getScoresByGameMode(
            @PathVariable GameMode gameMode) {
        
        List<GameScore> scores = gameScoreRepository.findByGameModeOrderByScoreDesc(gameMode);
        
        // Convert to simplified format
        List<Map<String, Object>> scoresList = formatScores(scores);
        
        return ResponseEntity.ok(scoresList);
    }
    
    /**
     * Helper method untuk memformat objek GameScore menjadi format yang lebih sederhana untuk response
     * 
     * @param scores daftar skor yang akan diformat
     * @return daftar skor dalam format Map untuk response JSON
     */
    private List<Map<String, Object>> formatScores(List<GameScore> scores) {
        return scores.stream()
            .map(score -> {
                Map<String, Object> scoreMap = new HashMap<>();
                
                scoreMap.put("username", score.getUser().getUsername());
                scoreMap.put("score", score.getScore());
                
                // Handle enum values safely
                if (score.getDifficulty() != null) {
                    scoreMap.put("difficulty", score.getDifficulty().name());
                }
                
                if (score.getGameMode() != null) {
                    scoreMap.put("gameMode", score.getGameMode().name());
                }
                
                if (score.getPlayedAt() != null) {
                    scoreMap.put("playedAt", score.getPlayedAt().toString());
                }
                
                return scoreMap;
            })
            .collect(Collectors.toList());
    }
}
