package com.skribbl.skribbl_word.config;

import com.skribbl.skribbl_word.config.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Konfigurasi keamanan aplikasi
 * Menerapkan Singleton Pattern melalui Spring Bean
 * Menyediakan konfigurasi untuk Spring Security dengan cara modern
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Autowired
    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    /**
     * Membuat bean PasswordEncoder yang berfungsi sebagai Singleton
     * untuk digunakan di seluruh aplikasi
     *
     * @return instance dari BCryptPasswordEncoder untuk mengamankan password
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Konfigurasi SecurityFilterChain
     * Mendefinisikan aturan keamanan untuk aplikasi
     *
     * @param http HttpSecurity untuk konfigurasi
     * @return SecurityFilterChain yang dikonfigurasi
     * @throws Exception jika terjadi error saat konfigurasi
     */    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/game/**").authenticated()
                .requestMatchers("/api/scores/**").authenticated()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                // Use IF_REQUIRED instead of STATELESS to support HttpSession for game state
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            // Tambahkan JWT filter sebelum filter UsernamePasswordAuthentication
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Menyediakan AuthenticationManager sebagai bean
     * untuk digunakan dalam proses otentikasi.
     *
     * @param config konfigurasi otentikasi
     * @return AuthenticationManager
     * @throws Exception jika terjadi error
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
