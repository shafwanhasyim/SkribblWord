package com.skribbl.skribbl_word.controller;

import com.skribbl.skribbl_word.dto.CreateWordRequestDTO;
import com.skribbl.skribbl_word.dto.UserResponseDTO;
import com.skribbl.skribbl_word.dto.WordResponseDTO;
import com.skribbl.skribbl_word.model.User;
import com.skribbl.skribbl_word.model.Word;
import com.skribbl.skribbl_word.service.AdminService;
import com.skribbl.skribbl_word.service.WordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controller untuk manajemen pengguna dan kata oleh admin
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    private final AdminService adminService;
    private final WordService wordService;
    
    /**
     * Constructor untuk Dependency Injection
     * 
     * @param adminService service untuk manajemen pengguna oleh admin
     * @param wordService service untuk manajemen kata
     */
    @Autowired
    public AdminController(AdminService adminService, WordService wordService) {
        this.adminService = adminService;
        this.wordService = wordService;
    }
    
    /**
     * Endpoint untuk mendapatkan semua pengguna
     * 
     * @return daftar semua pengguna dalam format UserResponseDTO
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<User> users = adminService.findAllUsers();
        
        List<UserResponseDTO> userResponses = users.stream()
                .map(user -> new UserResponseDTO(user.getId(), user.getUsername(), user.getEmail()))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(userResponses);
    }
    
    /**
     * Endpoint untuk menghapus pengguna berdasarkan ID
     * 
     * @param userId ID pengguna yang akan dihapus
     * @return ResponseEntity dengan status 204 No Content jika berhasil
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Endpoint untuk mendapatkan detail pengguna spesifik
     * 
     * @param userId ID pengguna yang dicari
     * @return detail pengguna dalam format UserResponseDTO
     */    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable UUID userId) {
        User user = adminService.findUserById(userId);
        
        UserResponseDTO userResponse = new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
        
        return ResponseEntity.ok(userResponse);
    }
    
    /**
     * Endpoint untuk membuat kata baru
     * 
     * @param request data kata yang akan dibuat
     * @return ResponseEntity dengan status 201 Created dan data kata yang telah dibuat
     */
    @PostMapping("/words")
    public ResponseEntity<WordResponseDTO> createWord(@RequestBody CreateWordRequestDTO request) {
        Word createdWord = wordService.createWord(request);
        
        WordResponseDTO response = new WordResponseDTO(
                createdWord.getId(),
                createdWord.getWord(),
                createdWord.getCategory(),
                createdWord.getDifficulty(),
                createdWord.getImageUrl()
        );
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    /**
     * Endpoint untuk mendapatkan semua kata
     * 
     * @return daftar semua kata dalam format WordResponseDTO
     */
    @GetMapping("/words")
    public ResponseEntity<List<WordResponseDTO>> getAllWords() {
        List<Word> words = wordService.getAllWords();
        
        List<WordResponseDTO> wordResponses = words.stream()
                .map(word -> new WordResponseDTO(
                        word.getId(),
                        word.getWord(),
                        word.getCategory(),
                        word.getDifficulty(),
                        word.getImageUrl()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(wordResponses);
    }
    
    /**
     * Endpoint untuk menghapus kata berdasarkan ID
     * 
     * @param wordId ID kata yang akan dihapus
     * @return ResponseEntity dengan status 204 No Content jika berhasil
     */
    @DeleteMapping("/words/{wordId}")
    public ResponseEntity<Void> deleteWord(@PathVariable UUID wordId) {
        wordService.deleteWord(wordId);
        return ResponseEntity.noContent().build();
    }
}
