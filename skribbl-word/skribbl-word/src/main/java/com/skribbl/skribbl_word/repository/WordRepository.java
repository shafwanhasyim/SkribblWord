package com.skribbl.skribbl_word.repository;

import com.skribbl.skribbl_word.model.GameDifficulty;
import com.skribbl.skribbl_word.model.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository untuk mengakses data Word di database
 * Menggunakan JpaRepository untuk operasi CRUD dasar
 */
@Repository
public interface WordRepository extends JpaRepository<Word, UUID> {
    /**
     * Menemukan kata acak sesuai dengan tingkat kesulitan
     *
     * @param difficulty tingkat kesulitan yang diinginkan
     * @return List kata sesuai dengan tingkat kesulitan
     */
    List<Word> findByDifficulty(GameDifficulty difficulty);
    
    /**
     * Mengambil kata acak dari database sesuai dengan tingkat kesulitan
     * Menggunakan native query untuk optimasi performa
     *
     * @param difficulty tingkat kesulitan yang diinginkan
     * @return kata acak
     */
    @Query(value = "SELECT * FROM words WHERE difficulty = :difficulty ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Word findRandomWordByDifficulty(@Param("difficulty") String difficulty);
    
    /**
     * Mengambil kata acak dari database tanpa melihat tingkat kesulitan
     * Menggunakan native query untuk optimasi performa
     *
     * @return kata acak dari semua tingkat kesulitan
     */
    @Query(value = "SELECT * FROM words ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Word findRandomWord();

    /**
     * Mengambil kata acak yang cocok untuk mode anak (kesulitan EASY, kategori tertentu, dan memiliki gambar)
     * Menggunakan native query untuk optimasi performa
     *
     * @return kata acak yang cocok untuk mode anak
     */
    @Query(value = "SELECT * FROM words WHERE difficulty = 'EASY' AND category IN ('HEWAN', 'BUAH', 'BENDA') AND image_url IS NOT NULL ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Optional<Word> findRandomWordForKids();
}
