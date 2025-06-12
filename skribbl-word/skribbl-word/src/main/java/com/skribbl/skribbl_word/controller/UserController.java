package com.skribbl.skribbl_word.controller;

import com.skribbl.skribbl_word.dto.UpdateProfileRequestDTO;
import com.skribbl.skribbl_word.dto.UserResponseDTO;
import com.skribbl.skribbl_word.model.User;
import com.skribbl.skribbl_word.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller untuk mengelola operasi terkait pengguna
 */
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final UserService userService;
    
    /**
     * Constructor untuk Dependency Injection
     * 
     * @param userService service untuk manajemen data pengguna
     */
    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    /**
     * Endpoint untuk mendapatkan data pengguna yang sedang login
     * 
     * @param userDetails detail pengguna yang disediakan oleh Spring Security
     * @return ResponseEntity dengan data pengguna dalam format UserResponseDTO
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        // Ambil username dari UserDetails
        String username = userDetails.getUsername();
        
        // Dapatkan objek User lengkap dari database
        User user = userService.getUserByUsername(username);
        
        // Konversi ke DTO sebelum dikirim sebagai respons
        UserResponseDTO userResponse = new UserResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
        
        return ResponseEntity.ok(userResponse);
    }

    /**
     * Endpoint untuk memperbarui data pengguna yang sedang login
     * 
     * @param userDetails detail pengguna yang disediakan oleh Spring Security
     * @param data data baru untuk profil pengguna
     * @return ResponseEntity dengan data pengguna yang sudah diperbarui
     */
    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequestDTO data) {
        
        // Ambil username dari UserDetails
        String username = userDetails.getUsername();
        
        // Update profil pengguna
        User updatedUser = userService.updateProfile(username, data);
        
        // Konversi ke DTO sebelum dikirim sebagai respons
        UserResponseDTO userResponse = new UserResponseDTO(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getEmail()
        );
        
        return ResponseEntity.ok(userResponse);
    }
}
