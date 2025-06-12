package com.skribbl.skribbl_word.controller;

import com.skribbl.skribbl_word.dto.CheckAnswerRequestDTO;
import com.skribbl.skribbl_word.dto.CheckAnswerResponseDTO;
import com.skribbl.skribbl_word.dto.GameStateResponseDTO;
import com.skribbl.skribbl_word.dto.KidsWordResponseDTO;
import com.skribbl.skribbl_word.dto.StartGameRequestDTO;
import com.skribbl.skribbl_word.dto.SubmitAnswerRequestDTO;
import com.skribbl.skribbl_word.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

/**
 * Controller untuk mengelola interaksi game
 */
@RestController
@RequestMapping("/api/game")
public class GameController {
    
    private final GameService gameService;
    
    /**
     * Constructor untuk Dependency Injection
     * 
     * @param gameService service untuk manajemen game
     */
    @Autowired
    public GameController(GameService gameService) {
        this.gameService = gameService;
    }
    
    /**
     * Endpoint untuk memulai permainan baru
     * 
     * @param request DTO berisi parameter untuk memulai game
     * @param session objek HttpSession untuk menyimpan state permainan
     * @param principal objek UserDetails berisi informasi user yang login
     * @return state awal permainan
     */
    @PostMapping("/start")
    public ResponseEntity<?> startGame(
            @RequestBody StartGameRequestDTO request,
            HttpSession session,
            @AuthenticationPrincipal UserDetails principal) {
        
        try {
            String username = principal.getUsername();
            GameStateResponseDTO gameState = gameService.startNewGame(username, request, session);
            return ResponseEntity.ok(gameState);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Endpoint untuk mengirim jawaban pemain
     * 
     * @param request DTO berisi jawaban pemain
     * @param session objek HttpSession yang menyimpan state permainan
     * @param principal objek UserDetails berisi informasi user yang login
     * @return state permainan setelah jawaban diolah
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitAnswer(
            @RequestBody SubmitAnswerRequestDTO request,
            HttpSession session,
            @AuthenticationPrincipal UserDetails principal) {
        
        try {
            String username = principal.getUsername();
            GameStateResponseDTO gameState = gameService.submitAnswer(username, request, session);
            return ResponseEntity.ok(gameState);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
      /**
     * Endpoint untuk mendapatkan status permainan saat ini
     * 
     * @param session objek HttpSession yang menyimpan state permainan
     * @param principal objek UserDetails berisi informasi user yang login
     * @return state permainan saat ini atau error jika tidak ada permainan yang sedang berlangsung
     */    @GetMapping("/state")
    public ResponseEntity<?> getCurrentGameState(
            HttpSession session,
            @AuthenticationPrincipal UserDetails principal) {
        
        try {
            String username = principal.getUsername();
            GameStateResponseDTO gameState = gameService.getCurrentGameState(session, username);
            return ResponseEntity.ok(gameState);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
      /**
     * Endpoint untuk mendapatkan petunjuk kata yang sedang dimainkan
     * 
     * @param session objek HttpSession yang menyimpan state permainan
     * @return petunjuk berupa kata yang sebagian hurufnya disamarkan
     */
    @GetMapping("/hint")
    public ResponseEntity<?> getHint(HttpSession session) {
        try {
            String hint = gameService.getHint(session);
            return ResponseEntity.ok(Map.of("hint", hint));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Endpoint untuk mengakhiri permainan saat ini
     * 
     * @param session objek HttpSession yang menyimpan state permainan
     * @param principal objek UserDetails berisi informasi user yang login
     * @return state permainan terakhir
     */    @PostMapping("/end")
    public ResponseEntity<?> endGame(
            HttpSession session,
            @AuthenticationPrincipal UserDetails principal) {
        
        try {
            String username = principal.getUsername();
            GameStateResponseDTO gameState = gameService.endGame(username, session);
            return ResponseEntity.ok(gameState);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Endpoint untuk mendapatkan kata baru untuk mode anak
     * 
     * @return ResponseEntity dengan KidsWordResponseDTO yang berisi data kata untuk mode anak
     */
    @GetMapping("/kids/new")
    public ResponseEntity<?> getNewKidsWord() {
        try {
            KidsWordResponseDTO response = gameService.getWordForKids();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Endpoint untuk memeriksa jawaban dalam mode anak
     * 
     * @param request DTO berisi ID kata dan jawaban yang dikirimkan
     * @return ResponseEntity dengan CheckAnswerResponseDTO yang berisi hasil pemeriksaan
     */
    @PostMapping("/kids/check")
    public ResponseEntity<?> checkKidsAnswer(@RequestBody CheckAnswerRequestDTO request) {
        try {
            CheckAnswerResponseDTO response = gameService.checkKidsAnswer(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
