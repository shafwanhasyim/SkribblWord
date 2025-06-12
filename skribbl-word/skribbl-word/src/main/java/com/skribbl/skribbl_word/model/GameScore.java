package com.skribbl.skribbl_word.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity yang merepresentasikan skor pemain dalam game
 */
@Entity
@Table(name = "game_scores")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameScore {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private int score;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameDifficulty difficulty;
    
    @Column(name = "played_at", nullable = false)
    private LocalDateTime playedAt;
      @Enumerated(EnumType.STRING)
    @Column(name = "game_mode")
    private GameMode gameMode;
}
