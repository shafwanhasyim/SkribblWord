package com.skribbl.skribbl_word.service;

import com.skribbl.skribbl_word.dto.LoginRequestDTO;
import com.skribbl.skribbl_word.dto.LoginResponseDTO;
import com.skribbl.skribbl_word.dto.RegisterRequestDTO;
import com.skribbl.skribbl_word.model.User;
import com.skribbl.skribbl_word.model.UserRole;
import com.skribbl.skribbl_word.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service untuk menangani proses otentikasi dan registrasi
 * Menerapkan Facade Pattern untuk menyederhanakan operasi otentikasi
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    /**
     * Constructor untuk Dependency Injection
     * Spring akan otomatis menyuntikkan instance dependency yang dibutuhkan
     *
     * @param userRepository repository untuk akses data User
     * @param passwordEncoder encoder untuk hash password
     * @param authenticationManager manager untuk otentikasi pengguna
     * @param jwtService service untuk manajemen token JWT
     */
    @Autowired
    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    /**
     * Mendaftarkan pengguna baru ke sistem
     *
     * @param data Data registrasi dari client (sekarang dalam bentuk record)
     * @return Objek User yang telah tersimpan di database
     * @throws IllegalStateException jika username sudah terdaftar
     */
    public User register(RegisterRequestDTO data) {
        // Cek apakah username sudah ada
        // PERUBAHAN DI SINI: Menggunakan data.username() bukan data.getUsername()
        if (userRepository.findByUsername(data.username()).isPresent()) {
            throw new IllegalStateException("Username sudah digunakan");
        }

        // Hash password
        // PERUBAHAN DI SINI: Menggunakan data.password() bukan data.getPassword()
        String hashedPassword = passwordEncoder.encode(data.password());        // Buat objek User baru menggunakan Builder Pattern
        User newUser = User.builder()
                // Menghapus .id(UUID.randomUUID()) agar id dihasilkan oleh database
                .username(data.username())
                .email(data.email())
                .passwordHash(hashedPassword)
                .role(UserRole.ROLE_USER)
                .build();

        // Simpan ke database dan kembalikan hasilnya
        return userRepository.save(newUser);
    }

    /**
     * Memproses login user
     *
     * @param data Data login dari client
     * @return DTO respons login yang berisi informasi pengguna dan token JWT
     */
    public LoginResponseDTO login(LoginRequestDTO data) {        // Otentikasi pengguna (akan throw exception jika gagal)
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(data.username(), data.password())
        );
        
        // Jika otentikasi berhasil (tidak ada exception), cari user dari database
        User user = userRepository.findByUsername(data.username())
            .orElseThrow(() -> new IllegalStateException("User tidak ditemukan"));
            
        // Generate token JWT
        String jwtToken = jwtService.generateToken(
            org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .authorities(user.getRole().name())
                .build()
        );
        
        // Kembalikan respons login
        return new LoginResponseDTO(
            user.getId(),
            user.getUsername(),
            jwtToken
        );
    }
}
