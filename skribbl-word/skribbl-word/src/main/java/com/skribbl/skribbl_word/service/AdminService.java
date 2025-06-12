package com.skribbl.skribbl_word.service;

import com.skribbl.skribbl_word.model.User;
import com.skribbl.skribbl_word.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Service untuk manajemen pengguna oleh admin
 */
@Service
public class AdminService {
    
    private final UserRepository userRepository;
    
    /**
     * Constructor untuk Dependency Injection
     * 
     * @param userRepository repository untuk akses data User
     */
    @Autowired
    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * Mengambil semua pengguna dari database
     * 
     * @return daftar semua pengguna
     */
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * Menghapus pengguna berdasarkan ID
     * 
     * @param userId ID pengguna yang akan dihapus
     */
    public void deleteUser(UUID userId) {
        userRepository.deleteById(userId);
    }
    
    /**
     * Mencari pengguna berdasarkan ID
     * 
     * @param userId ID pengguna yang dicari
     * @return objek User jika ditemukan
     * @throws IllegalArgumentException jika user tidak ditemukan
     */
    public User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan dengan ID: " + userId));
    }
}
