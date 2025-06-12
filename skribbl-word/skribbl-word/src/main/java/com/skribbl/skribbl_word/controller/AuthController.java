package com.skribbl.skribbl_word.controller;

import com.skribbl.skribbl_word.dto.LoginRequestDTO;
import com.skribbl.skribbl_word.dto.LoginResponseDTO;
import com.skribbl.skribbl_word.dto.RegisterRequestDTO;
import com.skribbl.skribbl_word.model.User;
import com.skribbl.skribbl_word.service.AuthService;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller untuk menangani permintaan otentikasi
 * Menyediakan endpoint REST untuk registrasi dan login
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    
    private final AuthService authService;
    
    /**
     * Constructor untuk Dependency Injection
     * 
     * @param authService service yang menangani operasi otentikasi
     */
    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    /**
     * Endpoint untuk registrasi pengguna baru
     * 
     * @param registerRequest data registrasi dari client
     * @return ResponseEntity dengan status 201 Created jika berhasil
     */    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequestDTO registerRequest) {
        try {
            log.info("Memproses registrasi untuk username: {}", registerRequest.username());
            User registeredUser = authService.register(registerRequest);
            log.info("Registrasi berhasil untuk user: {}", registeredUser.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
        } catch (IllegalStateException e) {
            // Tangani kasus username sudah ada
            log.warn("Registrasi gagal - username sudah digunakan: {}", registerRequest.username());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // Tangani error lainnya dengan logging stack trace lengkap
            log.error("Terjadi kesalahan saat registrasi user: {}", registerRequest.username(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Terjadi kesalahan saat registrasi"));
        }
    }
    
    /**
     * Endpoint untuk login pengguna
     * 
     * @param loginRequest data login dari client
     * @return ResponseEntity dengan status 200 OK dan token JWT jika berhasil
     */    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequestDTO loginRequest) {
        try {
            // Proses login
            log.info("Percobaan login untuk username: {}", loginRequest.username());
            LoginResponseDTO loginResponse = authService.login(loginRequest);
            
            // Buat cookie dengan JWT
            ResponseCookie jwtCookie = ResponseCookie.from("jwt", loginResponse.token())
                    .httpOnly(true)      // Mencegah akses dari JavaScript
                    .secure(true)        // Hanya dikirim melalui HTTPS
                    .path("/")           // Cookie tersedia di seluruh domain
                    .maxAge(24 * 60 * 60) // Masa berlaku 24 jam (dalam detik)
                    .build();
            
            log.info("Login berhasil untuk username: {}", loginRequest.username());        
            // Kembalikan respons dengan token di cookie dan data user di body
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                    .body(loginResponse);
        } catch (Exception e) {
            // Tangani error otentikasi dengan logging stack trace lengkap
            log.error("Gagal login untuk username: {}", loginRequest.username(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Username atau password salah"));
        }
    }
}
