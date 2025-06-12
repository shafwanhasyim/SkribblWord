package com.skribbl.skribbl_word.repository;

import com.skribbl.skribbl_word.model.GameDifficulty;
import com.skribbl.skribbl_word.model.GameMode;
import com.skribbl.skribbl_word.model.GameScore;
import com.skribbl.skribbl_word.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository untuk mengakses data GameScore di database
 */
@Repository
public interface GameScoreRepository extends JpaRepository<GameScore, UUID> {
    
    /**
     * Mencari skor game berdasarkan pengguna
     * 
     * @param user pengguna yang akan dicari skornya
     * @return daftar skor game dari pengguna tersebut
     */
    List<GameScore> findByUser(User user);
    
    /**
     * Mencari skor game berdasarkan pengguna, diurutkan berdasarkan skor tertinggi
     * 
     * @param user pengguna yang akan dicari skornya
     * @return daftar skor game dari pengguna tersebut
     */
    List<GameScore> findByUserOrderByScoreDesc(User user);
    
    /**
     * Mencari skor tertinggi dari semua pemain, diurutkan dari yang tertinggi
     * 
     * @return daftar skor tertinggi
     */
    List<GameScore> findTop10ByOrderByScoreDesc();
    
    /**
     * Mencari skor tertinggi berdasarkan tingkat kesulitan
     * 
     * @param difficulty tingkat kesulitan yang akan dicari skornya
     * @return daftar skor tertinggi untuk tingkat kesulitan tersebut
     */
    List<GameScore> findTop10ByDifficultyOrderByScoreDesc(GameDifficulty difficulty);
    
    /**
     * Mencari skor game berdasarkan mode permainan
     * 
     * @param gameMode mode permainan yang akan dicari skornya
     * @return daftar skor game untuk mode permainan tersebut
     */
    List<GameScore> findByGameModeOrderByScoreDesc(GameMode gameMode);
    
    /**
     * Mencari skor game berdasarkan mode permainan dan tingkat kesulitan
     * 
     * @param gameMode mode permainan yang akan dicari skornya
     * @param difficulty tingkat kesulitan yang akan dicari skornya
     * @return daftar skor game untuk mode dan tingkat kesulitan tersebut
     */
    List<GameScore> findTop10ByGameModeAndDifficultyOrderByScoreDesc(GameMode gameMode, GameDifficulty difficulty);
}
