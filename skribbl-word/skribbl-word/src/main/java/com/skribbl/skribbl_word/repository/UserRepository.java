package com.skribbl.skribbl_word.repository;

import com.skribbl.skribbl_word.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface untuk entitas User
 * Menerapkan prinsip Abstraksi dalam OOP melalui Spring Data JPA
 * Menggunakan fitur query creation dari Spring Data JPA untuk mendefinisikan
 * operasi database tanpa implementasi konkrit
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    /**
     * Mencari user berdasarkan username
     * @param username username yang ingin dicari
     * @return Optional yang berisi User jika ditemukan, atau empty jika tidak
     */
    Optional<User> findByUsername(String username);
}
