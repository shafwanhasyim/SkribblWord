package com.skribbl.skribbl_word.service;

import com.skribbl.skribbl_word.dto.CheckAnswerRequestDTO;
import com.skribbl.skribbl_word.dto.CheckAnswerResponseDTO;
import com.skribbl.skribbl_word.dto.GameStateResponseDTO;
import com.skribbl.skribbl_word.dto.KidsWordResponseDTO;
import com.skribbl.skribbl_word.dto.StartGameRequestDTO;
import com.skribbl.skribbl_word.dto.SubmitAnswerRequestDTO;
import com.skribbl.skribbl_word.model.GameDifficulty;
import com.skribbl.skribbl_word.model.GameMode;
import com.skribbl.skribbl_word.model.GameScore;
import com.skribbl.skribbl_word.model.GameSessionState;
import com.skribbl.skribbl_word.model.User;
import com.skribbl.skribbl_word.model.Word;
import com.skribbl.skribbl_word.repository.GameScoreRepository;
import com.skribbl.skribbl_word.repository.WordRepository;
import com.skribbl.skribbl_word.util.GameUtil;
import com.skribbl.skribbl_word.util.WordScrambler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpSession;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Service untuk mengelola logika permainan
 */
@Service
public class GameService {
    private static final Logger logger = LoggerFactory.getLogger(GameService.class);
    private static final String GAME_STATE_ATTR = "gameState";
    private static final long GAME_DURATION_MILLIS = 120000; // 2 menit
    private static final Random random = new Random();

    // Game mode constants
    private static final int SURVIVAL_MAX_LIVES = 3; // Jumlah nyawa maksimal untuk mode survival

    private final WordRepository wordRepository;
    private final GameScoreRepository gameScoreRepository;
    private final UserService userService;

    /**
     * Constructor untuk Dependency Injection
     * 
     * @param wordRepository      repository untuk akses data Word
     * @param gameScoreRepository repository untuk akses data GameScore
     * @param userService         service untuk mengakses data User
     */
    @Autowired
    public GameService(WordRepository wordRepository, GameScoreRepository gameScoreRepository,
            UserService userService) {
        this.wordRepository = wordRepository;
        this.gameScoreRepository = gameScoreRepository;
        this.userService = userService;
    }

    /**
     * Memulai permainan baru
     * 
     * @param username username pemain yang memulai game
     * @param request  DTO berisi parameter untuk memulai game
     * @param session  objek HttpSession untuk menyimpan state permainan
     * @return DTO berisi state permainan awal
     */
    public GameStateResponseDTO startNewGame(String username, StartGameRequestDTO request, HttpSession session) {
        synchronized (session) {
            // Inisialisasi state permainan baru
            GameSessionState gameState = new GameSessionState();
            gameState.setScore(0);
            gameState.setStreakCount(0);
            gameState.setDifficulty(request.difficulty());
            gameState.setGameMode(request.gameMode()); // Menggunakan game mode dari request

            // Inisialisasi berdasarkan game mode
            if (request.gameMode() == GameMode.TIME_ATTACK) {
                gameState.setEndTimeMillis(System.currentTimeMillis() + GAME_DURATION_MILLIS);
                gameState.setLives(0); // Mode time attack tidak menggunakan nyawa
            } else if (request.gameMode() == GameMode.SURVIVAL) {
                gameState.setEndTimeMillis(0); // Mode survival tidak menggunakan batas waktu
                gameState.setLives(SURVIVAL_MAX_LIVES); // Inisialisasi jumlah nyawa untuk mode survival
            }

            // Ambil kata acak sesuai kesulitan
            Word randomWord = getRandomWordByDifficulty(request.difficulty());
            if (randomWord == null) {
                throw new IllegalStateException("Tidak ada kata yang tersedia untuk kesulitan " + request.difficulty());
            }

            // Siapkan kata untuk permainan
            prepareWordForGame(gameState, randomWord);

            // Simpan state ke dalam session
            session.setAttribute(GAME_STATE_ATTR, gameState);
            // Buat response DTO
            return new GameStateResponseDTO(
                    gameState.getScrambledWord(),
                    gameState.getScore(),
                    gameState.getStreakCount(),
                    gameState.getTimeLeftSeconds(),
                    false,
                    null,
                    false,
                    gameState.getCurrentWordId(),
                    gameState.getCategory(),
                    gameState.getImageUrl(),
                    gameState.getGameMode(),
                    gameState.getLives());
        }
    }

    /**
     * Memproses jawaban pemain
     *
     * @param username username pemain yang menjawab
     * @param request  DTO berisi jawaban pemain
     * @param session  objek HttpSession yang menyimpan state permainan
     * @return DTO berisi state permainan setelah jawaban diolah
     */    public GameStateResponseDTO submitAnswer(String username, SubmitAnswerRequestDTO request, HttpSession session) {
        synchronized (session) {
            // Ambil state permainan dari session
            GameSessionState gameState = (GameSessionState) session.getAttribute(GAME_STATE_ATTR);
            if (gameState == null) {
                throw new IllegalStateException("Tidak ada permainan yang sedang berlangsung");
            }

            // Cek apakah waktu sudah habis (hanya untuk mode TIME_ATTACK)
            if (gameState.getGameMode() == GameMode.TIME_ATTACK && gameState.isTimeUp()) {
                // Gunakan method endGame untuk menangani game over dan penyimpanan skor
                return endGame(username, session);
            }

            // Flag untuk mengindikasikan apakah jawaban benar
            boolean isCorrect = false;
            String correctAnswer = null;

            // Periksa jawaban pemain
            if (request.answer().trim().equalsIgnoreCase(gameState.getOriginalWord().trim())) {
                // Jawaban benar, update skor dan streak
                isCorrect = true;
                updateScoreAndStreak(gameState, true);
            } else {
                // Jawaban salah, reset streak dan berikan jawaban yang benar
                correctAnswer = gameState.getOriginalWord();
                updateScoreAndStreak(gameState, false);

                // Kurangi nyawa jika dalam mode SURVIVAL
                if (gameState.getGameMode() == GameMode.SURVIVAL) {
                    int remainingLives = gameState.reduceLives();
                    logger.info("Player {} lost a life in SURVIVAL mode. Remaining lives: {}", username,
                            remainingLives);                    // Jika nyawa habis, permainan berakhir
                    if (remainingLives <= 0) {
                        // Gunakan method endGame untuk menangani game over dan penyimpanan skor
                        return endGame(username, session);
                    }
                }
            }

            // Ambil kata baru
            Word nextWord = getRandomWordByDifficulty(gameState.getDifficulty());
            prepareWordForGame(gameState, nextWord);

            // Update state di session
            session.setAttribute(GAME_STATE_ATTR, gameState);

            // Buat response DTO
            if (isCorrect) {
                return new GameStateResponseDTO(
                        gameState.getScrambledWord(),
                        gameState.getScore(),
                        gameState.getStreakCount(),
                        gameState.getTimeLeftSeconds(),
                        true,
                        null,
                        false,
                        gameState.getCurrentWordId(),
                        gameState.getCategory(),
                        gameState.getImageUrl(),
                        gameState.getGameMode(),
                        gameState.getLives());
            } else {
                return new GameStateResponseDTO(
                        gameState.getScrambledWord(),
                        gameState.getScore(),
                        gameState.getStreakCount(),
                        gameState.getTimeLeftSeconds(),
                        false,
                        correctAnswer,
                        false,
                        gameState.getCurrentWordId(),
                        gameState.getCategory(),
                        gameState.getImageUrl(),
                        gameState.getGameMode(),
                        gameState.getLives());
            }
        }
    }

    /**
     * Mengambil kata acak sesuai tingkat kesulitan
     * 
     * @param difficulty tingkat kesulitan kata yang diinginkan
     * @return objek Word yang dipilih secara acak
     */
    private Word getRandomWordByDifficulty(GameDifficulty difficulty) {
        Word randomWord = null;

        // Jika difficulty adalah RANDOM, ambil kata acak dari semua tingkat kesulitan
        if (difficulty == GameDifficulty.RANDOM) {
            randomWord = wordRepository.findRandomWord();
            logger.info("Getting random word from ALL difficulties");
        } else {
            // Gunakan query khusus untuk mendapatkan kata acak dengan tingkat kesulitan
            // tertentu
            randomWord = wordRepository.findRandomWordByDifficulty(difficulty.name());
            logger.info("Getting random word with difficulty: {}", difficulty);
        }

        // Jika query khusus gagal (mungkin karena DBMS tidak mendukung RANDOM()),
        // gunakan alternatif
        if (randomWord == null) {
            logger.info("Falling back to manual random selection for words");

            List<Word> filteredWords;

            if (difficulty == GameDifficulty.RANDOM) {
                // Ambil semua kata tanpa memperhatikan kesulitan
                filteredWords = wordRepository.findAll();
            } else {
                // Filter berdasarkan tingkat kesulitan
                filteredWords = wordRepository.findByDifficulty(difficulty);
            }

            if (filteredWords.isEmpty()) {
                logger.warn("No words found for difficulty: {}", difficulty);
                return null;
            }

            // Choose a random word
            int randomIndex = random.nextInt(filteredWords.size());
            randomWord = filteredWords.get(randomIndex);
        }

        return randomWord;
    }

    /**
     * Mempersiapkan kata untuk permainan (mengacak, dll)
     * 
     * @param gameState state permainan yang akan diupdate
     * @param word      kata yang akan digunakan dalam permainan
     */
    private void prepareWordForGame(GameSessionState gameState, Word word) {
        gameState.setCurrentWordId(word.getId());
        gameState.setOriginalWord(word.getWord());
        gameState.setCategory(word.getCategory());
        gameState.setImageUrl(word.getImageUrl());
        gameState.setCurrentWord(word); // Menyimpan referensi ke objek Word saat ini

        // Acak kata menggunakan WordScrambler
        String scrambledWord = WordScrambler.scramble(word.getWord());
        gameState.setScrambledWord(scrambledWord);

        // Jika menggunakan mode RANDOM, log level kesulitan dari kata yang dipilih
        if (gameState.getDifficulty() == GameDifficulty.RANDOM) {
            logger.info("Random word selected with actual difficulty: {}", word.getDifficulty());
        }
    }

    /**
     * Update skor dan streak berdasarkan jawaban pemain
     * 
     * @param gameState state permainan yang akan diupdate
     * @param isCorrect flag yang menandakan apakah jawaban benar
     */
    private void updateScoreAndStreak(GameSessionState gameState, boolean isCorrect) {
        if (isCorrect) {
            int basePoints;

            // Jika difficulty adalah RANDOM dan objek kata tersedia, gunakan difficulty
            // yang sebenarnya
            if (gameState.getDifficulty() == GameDifficulty.RANDOM && gameState.getCurrentWord() != null) {
                // Gunakan difficulty dari kata yang sebenarnya untuk menghitung poin
                basePoints = GameUtil.calculateBasePointsFromWord(gameState.getCurrentWord());
                logger.info("Using actual word difficulty for scoring: {}", gameState.getCurrentWord().getDifficulty());
            } else {
                // Gunakan difficulty dari game state
                basePoints = GameUtil.calculateBasePoints(gameState.getDifficulty());
            }

            // Increment streak
            gameState.setStreakCount(gameState.getStreakCount() + 1);

            // Calculate bonus based on streak
            int streakBonus = GameUtil.calculateStreakBonus(gameState.getStreakCount());

            // Calculate bonus based on time left
            int timeBonus = GameUtil.calculateTimeBonus(gameState.getTimeLeftSeconds());

            // Add points to score
            gameState.setScore(gameState.getScore() + basePoints + streakBonus + timeBonus);

            logger.info("Points added: base={}, streak bonus={}, time bonus={}, total score={}",
                    basePoints, streakBonus, timeBonus, gameState.getScore());
        } else {
            // Reset streak on wrong answer
            gameState.setStreakCount(0);
        }
    }    /**
     * Mengambil status permainan saat ini
     * 
     * @param session objek HttpSession yang menyimpan state permainan
     * @param username username pemain yang sedang bermain
     * @return DTO berisi state permainan saat ini
     * @throws IllegalStateException jika tidak ada permainan yang sedang
     *                               berlangsung
     */
    public GameStateResponseDTO getCurrentGameState(HttpSession session, String username) {
        synchronized (session) {
            // Ambil state permainan dari session
            GameSessionState gameState = (GameSessionState) session.getAttribute(GAME_STATE_ATTR);
            if (gameState == null) {
                throw new IllegalStateException("Tidak ada permainan yang sedang berlangsung");
            }

            // Cek apakah waktu sudah habis (hanya untuk mode TIME_ATTACK)
            if (gameState.getGameMode() == GameMode.TIME_ATTACK && gameState.isTimeUp()) {
                // Gunakan method endGame untuk menangani game over dan penyimpanan skor
                return endGame(username, session);
            }
            // Kembalikan state saat ini
            return new GameStateResponseDTO(
                    gameState.getScrambledWord(),
                    gameState.getScore(),
                    gameState.getStreakCount(),
                    gameState.getTimeLeftSeconds(),
                    false,
                    null,
                    false,
                    gameState.getCurrentWordId(),
                    gameState.getCategory(),
                    gameState.getImageUrl(),
                    gameState.getGameMode(),
                    gameState.getLives());
        }
    }

    /**
     * Mengambil status permainan saat ini (backward compatibility)
     * 
     * @param session objek HttpSession yang menyimpan state permainan
     * @return DTO berisi state permainan saat ini
     * @throws IllegalStateException jika tidak ada permainan yang sedang
     *                               berlangsung
     * @deprecated Gunakan getCurrentGameState(HttpSession session, String username) sebagai gantinya
     */
    @Deprecated
    public GameStateResponseDTO getCurrentGameState(HttpSession session) {
        // Gunakan SecurityContext untuk mendapatkan username
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String username = auth.getName();
            return getCurrentGameState(session, username);
        } else {
            // Fallback ke method lama jika tidak ada user yang terautentikasi
            synchronized (session) {
                // Ambil state permainan dari session
                GameSessionState gameState = (GameSessionState) session.getAttribute(GAME_STATE_ATTR);
                if (gameState == null) {
                    throw new IllegalStateException("Tidak ada permainan yang sedang berlangsung");
                }

                // Cek apakah waktu sudah habis (hanya untuk mode TIME_ATTACK)
                if (gameState.getGameMode() == GameMode.TIME_ATTACK && gameState.isTimeUp()) {
                    // Simpan skor ke database
                    saveGameScore(gameState);

                    // Hapus state dari session
                    session.removeAttribute(GAME_STATE_ATTR);

                    // Kembalikan state game over
                    return GameStateResponseDTO.gameOver(gameState.getScore(), gameState.getGameMode(),
                            gameState.getLives());
                }
                
                // Kembalikan state saat ini
                return new GameStateResponseDTO(
                        gameState.getScrambledWord(),
                        gameState.getScore(),
                        gameState.getStreakCount(),
                        gameState.getTimeLeftSeconds(),
                        false,
                        null,
                        false,
                        gameState.getCurrentWordId(),
                        gameState.getCategory(),
                        gameState.getImageUrl(),
                        gameState.getGameMode(),
                        gameState.getLives());
            }
        }
    }

    /**
     * Memberikan petunjuk untuk kata yang sedang ditebak
     * 
     * @param session objek HttpSession yang menyimpan state permainan
     * @return petunjuk berupa kata dengan beberapa huruf disamarkan
     * @throws IllegalStateException jika tidak ada permainan yang sedang
     *                               berlangsung
     */
    public String getHint(HttpSession session) {
        synchronized (session) {
            // Ambil state permainan dari session
            GameSessionState gameState = (GameSessionState) session.getAttribute(GAME_STATE_ATTR);
            if (gameState == null) {
                throw new IllegalStateException("Tidak ada permainan yang sedang berlangsung");
            }

            // Cek apakah waktu sudah habis (untuk mode TIME_ATTACK)
            if (gameState.getGameMode() == GameMode.TIME_ATTACK && gameState.isTimeUp()) {
                throw new IllegalStateException("Waktu permainan sudah habis");
            }

            // Kurangi skor sebagai penalti untuk menggunakan hint
            int penaltyPoints = 5;

            if (gameState.getGameMode() == GameMode.SURVIVAL) {
                // Untuk mode SURVIVAL, menggunakan hint mengurangi satu nyawa
                if (gameState.getLives() <= 1) {
                    throw new IllegalStateException("Nyawa tidak cukup untuk menggunakan petunjuk");
                }
                gameState.reduceLives();
                logger.info("Player used hint in SURVIVAL mode. Remaining lives: {}", gameState.getLives());
            } else {
                // Untuk mode TIME_ATTACK, mengurangi skor
                int currentScore = gameState.getScore();

                // Pastikan skor tidak negatif
                if (currentScore >= penaltyPoints) {
                    gameState.setScore(currentScore - penaltyPoints);
                } else {
                    gameState.setScore(0);
                }
            }

            // Update state di session
            session.setAttribute(GAME_STATE_ATTR, gameState);

            // Berikan petunjuk
            return GameUtil.getHint(gameState.getOriginalWord());
        }
    }    /**
     * Mengakhiri permainan saat ini
     * 
     * @param username username pemain yang mengakhiri game
     * @param session objek HttpSession yang menyimpan state permainan
     * @return DTO berisi state permainan terakhir
     * @throws IllegalStateException jika tidak ada permainan yang sedang
     *                               berlangsung
     */
    public GameStateResponseDTO endGame(String username, HttpSession session) {
        synchronized (session) {
            // Ambil state permainan dari session
            GameSessionState gameState = (GameSessionState) session.getAttribute(GAME_STATE_ATTR);
            if (gameState == null) {
                throw new IllegalStateException("Tidak ada permainan yang sedang berlangsung");
            }

            // Simpan skor ke database menggunakan username yang diberikan
            saveFinalScore(username, gameState);

            // Hapus state dari session
            session.removeAttribute(GAME_STATE_ATTR);

            // Kembalikan state game over dengan game mode dan lives
            return GameStateResponseDTO.gameOver(gameState.getScore(), gameState.getGameMode(), gameState.getLives());
        }
    }
    
    /**
     * Mengakhiri permainan saat ini (backward compatibility)
     * 
     * @param session objek HttpSession yang menyimpan state permainan
     * @return DTO berisi state permainan terakhir
     * @throws IllegalStateException jika tidak ada permainan yang sedang
     *                               berlangsung
     * @deprecated Gunakan endGame(String username, HttpSession session) sebagai gantinya
     */
    @Deprecated
    public GameStateResponseDTO endGame(HttpSession session) {
        // Gunakan SecurityContext untuk mendapatkan username
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String username = auth.getName();
            return endGame(username, session);
        } else {
            // Fallback ke metode lama jika tidak ada user yang terautentikasi
            synchronized (session) {
                GameSessionState gameState = (GameSessionState) session.getAttribute(GAME_STATE_ATTR);
                if (gameState == null) {
                    throw new IllegalStateException("Tidak ada permainan yang sedang berlangsung");
                }

                // Simpan skor ke database
                saveGameScore(gameState);

                // Hapus state dari session
                session.removeAttribute(GAME_STATE_ATTR);

                // Kembalikan state game over dengan game mode dan lives
                return GameStateResponseDTO.gameOver(gameState.getScore(), gameState.getGameMode(), gameState.getLives());
            }
        }
    }

    /**
     * Menyimpan skor akhir permainan ke database
     * 
     * @param gameState state permainan yang berisi skor
     */
    private void saveGameScore(GameSessionState gameState) {
        try {
            // Get current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                String username = auth.getName();
                User user = userService.getUserByUsername(username);

                // Create and save game score
                GameScore score = GameScore.builder()
                        .user(user)
                        .score(gameState.getScore())
                        .difficulty(gameState.getDifficulty())
                        .playedAt(LocalDateTime.now())
                        .gameMode(gameState.getGameMode())
                        .build();

                gameScoreRepository.save(score);
                logger.info("Game score saved: {} points for user {}", gameState.getScore(), username);
            } else {
                logger.warn("No authenticated user found, game score not saved");
            }
        } catch (Exception e) {
            logger.error("Error saving game score", e);
        }
    }

    /**
     * Menyimpan skor akhir permainan ke database dengan username yang eksplisit
     * 
     * @param username username pemain yang datanya akan disimpan
     * @param gameState state permainan yang berisi skor
     */
    private void saveFinalScore(String username, GameSessionState gameState) {
        try {
            // Get user from username
            User user = userService.getUserByUsername(username);
            if (user != null) {
                // Create and save game score
                GameScore score = GameScore.builder()
                        .user(user)
                        .score(gameState.getScore())
                        .difficulty(gameState.getDifficulty())
                        .playedAt(LocalDateTime.now())
                        .gameMode(gameState.getGameMode())
                        .build();

                gameScoreRepository.save(score);
                logger.info("Game score saved: {} points for user {}", gameState.getScore(), username);
            } else {
                logger.warn("User not found for username: {}, game score not saved", username);
            }
        } catch (Exception e) {
            logger.error("Error saving game score for user " + username, e);
        }
    }

    /**
     * Mengambil kata acak untuk mode anak
     * 
     * @return DTO berisi data kata untuk mode anak
     * @throws IllegalStateException jika tidak ada kata yang tersedia untuk mode anak
     */
    public KidsWordResponseDTO getWordForKids() {
        // Ambil kata acak yang cocok untuk anak-anak
        Word randomWord = wordRepository.findRandomWordForKids()
            .orElseThrow(() -> new IllegalStateException("Tidak ada kata yang tersedia untuk mode anak"));
        
        logger.info("Getting random word for kids mode with ID: {}", randomWord.getId());
        
        // Konversi kata menjadi list karakter
        List<Character> letters = new ArrayList<>();
        for (char c : randomWord.getWord().toCharArray()) {
            letters.add(c);
        }
        
        // Buat dan kembalikan response DTO
        return new KidsWordResponseDTO(
            randomWord.getId(),
            randomWord.getImageUrl(),
            letters
        );
    }
    
    /**
     * Memeriksa jawaban untuk mode anak
     * 
     * @param request DTO berisi jawaban yang dikirimkan
     * @return DTO berisi hasil pemeriksaan jawaban
     * @throws IllegalArgumentException jika kata tidak ditemukan
     */
    public CheckAnswerResponseDTO checkKidsAnswer(CheckAnswerRequestDTO request) {
        // Cari kata berdasarkan ID
        Word word = wordRepository.findById(request.wordId())
            .orElseThrow(() -> new IllegalArgumentException("Kata tidak ditemukan dengan ID: " + request.wordId()));
        
        // Bandingkan jawaban dengan kata asli (abaikan besar kecil huruf)
        boolean isCorrect = request.submittedAnswer().trim().equalsIgnoreCase(word.getWord().trim());
        
        logger.info("Kids mode answer check for word ID {}: submitted '{}', correct '{}', result: {}", 
                request.wordId(), request.submittedAnswer(), word.getWord(), isCorrect);
                
        // Buat dan kembalikan response DTO
        return new CheckAnswerResponseDTO(isCorrect);
    }
}
