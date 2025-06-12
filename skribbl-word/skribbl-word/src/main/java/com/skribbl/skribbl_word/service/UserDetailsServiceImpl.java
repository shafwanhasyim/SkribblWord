package com.skribbl.skribbl_word.service;

import com.skribbl.skribbl_word.model.User;
import com.skribbl.skribbl_word.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Implementasi UserDetailsService untuk integrasi dengan Spring Security
 * Menerapkan pilar Abstraksi dengan mengimplementasikan interface dari Spring Security
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    
    /**
     * Constructor untuk Dependency Injection
     * 
     * @param userRepository repository untuk akses data User
     */
    @Autowired
    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * Memuat data pengguna dari database berdasarkan username
     * Mengkonversi User model menjadi UserDetails yang dipahami oleh Spring Security
     * 
     * @param username username yang ingin dimuat
     * @return UserDetails yang berisi data pengguna untuk otentikasi
     * @throws UsernameNotFoundException jika username tidak ditemukan
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Mencari user di database
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Username tidak ditemukan: " + username));
        
        // Konversi User model menjadi UserDetails
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name())))
                .build();
    }
}
