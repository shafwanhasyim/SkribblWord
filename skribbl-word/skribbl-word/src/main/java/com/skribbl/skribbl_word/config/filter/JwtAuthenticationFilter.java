package com.skribbl.skribbl_word.config.filter;

import com.skribbl.skribbl_word.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter untuk memvalidasi JWT dan menetapkan otentikasi pengguna
 * Menerapkan Chain of Responsibility Pattern
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    
    /**
     * Constructor untuk Dependency Injection
     * 
     * @param jwtService service untuk manajemen JWT
     * @param userDetailsService service untuk memuat detail pengguna
     */
    @Autowired
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }    @Override
    protected void doFilterInternal(
            HttpServletRequest request, 
            HttpServletResponse response, 
            FilterChain filterChain) throws ServletException, IOException {
        
        // Ambil header Authorization
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;
        
        // Cek apakah header ada dan formatnya valid
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Jika tidak valid, lanjut ke filter berikutnya
            filterChain.doFilter(request, response);
            return;
        }
        
        // Ekstrak token dari header
        jwt = authHeader.substring(7); // Hapus "Bearer " dari header
        
        try {
            // Ekstrak username dari token JWT
            username = jwtService.extractUsername(jwt);
            
            // Cek apakah username ada dan belum terautentikasi
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Muat UserDetails dari database
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                // Validasi token
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Log info peran pengguna untuk debugging
                    log.info("User '{}' diautentikasi dengan peran: {}", 
                            userDetails.getUsername(), 
                            userDetails.getAuthorities());
                    
                    // Buat token autentikasi
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, // credentials
                            userDetails.getAuthorities()
                    );
                    
                    // Tambahkan detail tentang request
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Tetapkan autentikasi ke SecurityContextHolder
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    log.warn("Token tidak valid untuk user: {}", username);
                }
            }
        } catch (Exception e) {
            // Log error jika terjadi masalah saat memproses token
            log.error("Gagal memproses token JWT: ", e);
        }
        
        // Lanjutkan filter chain
        filterChain.doFilter(request, response);
    }
}
