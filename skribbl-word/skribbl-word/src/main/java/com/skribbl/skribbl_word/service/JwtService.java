package com.skribbl.skribbl_word.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service untuk menangani operasi JWT (JSON Web Token)
 * Menerapkan Single Responsibility Principle dengan fokus pada manajemen token
 */
@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;
    
    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    /**
     * Mengekstrak username dari token JWT
     * 
     * @param token token JWT
     * @return username yang terkandung dalam token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Mengekstrak klaim spesifik dari token JWT menggunakan function resolver
     * 
     * @param token token JWT
     * @param claimsResolver function untuk mengekstrak klaim spesifik
     * @param <T> tipe data dari klaim yang diekstrak
     * @return nilai klaim yang diekstrak
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    /**
     * Menghasilkan token JWT dengan username sebagai subject
     * 
     * @param userDetails detail pengguna dari Spring Security
     * @return token JWT yang dihasilkan
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }
    
    /**
     * Menghasilkan token JWT dengan klaim tambahan
     * 
     * @param extraClaims klaim tambahan untuk dimasukkan ke dalam token
     * @param userDetails detail pengguna dari Spring Security
     * @return token JWT yang dihasilkan
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    /**
     * Memeriksa apakah token valid untuk pengguna tertentu
     * 
     * @param token token JWT yang akan divalidasi
     * @param userDetails detail pengguna untuk validasi
     * @return true jika token valid, false jika tidak
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }
    
    /**
     * Memeriksa apakah token sudah kedaluwarsa
     * 
     * @param token token JWT yang akan diperiksa
     * @return true jika token sudah kedaluwarsa, false jika belum
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    /**
     * Mengekstrak waktu kedaluwarsa dari token
     * 
     * @param token token JWT
     * @return waktu kedaluwarsa token
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    /**
     * Mengekstrak semua klaim dari token JWT
     * 
     * @param token token JWT
     * @return semua klaim dalam token
     */
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    /**
     * Mendapatkan kunci untuk menandatangani token
     * 
     * @return kunci untuk signing token
     */
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
