package com.skribbl.skribbl_word.service;

import com.skribbl.skribbl_word.dto.UpdateProfileRequestDTO;
import com.skribbl.skribbl_word.model.User;
import com.skribbl.skribbl_word.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Service untuk manajemen data pengguna
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    /**
     * Constructor untuk Dependency Injection
     * 
     * @param userRepository repository untuk akses data User
     */
    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Mendapatkan data pengguna berdasarkan username
     *
     * @param username username pengguna yang dicari
     * @return Objek User yang dicari
     * @throws UsernameNotFoundException jika username tidak ditemukan
     */
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User tidak ditemukan dengan username: " + username));
    }

    /**
     * Memperbarui profil pengguna
     *
     * @param username username pengguna yang akan diupdate
     * @param data data baru untuk profil pengguna
     * @return Objek User yang sudah diperbarui
     * @throws UsernameNotFoundException jika username tidak ditemukan
     */
    public User updateProfile(String username, UpdateProfileRequestDTO data) {
        // Cari user berdasarkan username
        User user = getUserByUsername(username);
        
        // Update field yang relevan
        if (data.email() != null) {
            user.setEmail(data.email());
        }
        
        // Simpan perubahan ke database
        return userRepository.save(user);
    }
}
