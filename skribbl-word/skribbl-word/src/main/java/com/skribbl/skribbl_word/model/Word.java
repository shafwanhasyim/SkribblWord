package com.skribbl.skribbl_word.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Entity yang merepresentasikan kata dalam game
 * Menerapkan Builder Pattern dan prinsip enkapsulasi
 */
@Entity
@Table(name = "words")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Word {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String word;
    
    @Column
    private String category;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GameDifficulty difficulty;
    
    @Column(name = "image_url")
    private String imageUrl;
}
