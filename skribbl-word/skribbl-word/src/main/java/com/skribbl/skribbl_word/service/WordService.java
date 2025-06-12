package com.skribbl.skribbl_word.service;

import com.skribbl.skribbl_word.dto.CreateWordRequestDTO;
import com.skribbl.skribbl_word.model.Word;
import com.skribbl.skribbl_word.repository.WordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Service untuk manajemen kata dalam game
 */
@Service
public class WordService {
    
    private final WordRepository wordRepository;
    
    /**
     * Constructor untuk Dependency Injection
     * 
     * @param wordRepository repository untuk akses data Word
     */
    @Autowired
    public WordService(WordRepository wordRepository) {
        this.wordRepository = wordRepository;
    }
    
    /**
     * Membuat kata baru berdasarkan request DTO
     * 
     * @param request DTO berisi data kata yang akan dibuat
     * @return objek Word yang telah disimpan
     */
    public Word createWord(CreateWordRequestDTO request) {
        Word word = Word.builder()
                .word(request.word())
                .category(request.category())
                .difficulty(request.difficulty())
                .imageUrl(request.imageUrl())
                .build();
        
        return wordRepository.save(word);
    }
    
    /**
     * Mengambil semua kata dari database
     * 
     * @return daftar semua kata
     */
    public List<Word> getAllWords() {
        return wordRepository.findAll();
    }
    
    /**
     * Menghapus kata berdasarkan ID
     * 
     * @param wordId ID kata yang akan dihapus
     */
    public void deleteWord(UUID wordId) {
        wordRepository.deleteById(wordId);
    }
}
