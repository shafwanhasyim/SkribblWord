package com.skribbl.skribbl_word.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Kelas utilitas untuk mengacak kata dalam game
 */
public class WordScrambler {

    /**
     * Mengacak karakter-karakter dalam sebuah kata.
     * Metode ini sekarang menjadi satu-satunya entry point dan lebih robust.
     *
     * @param word kata yang akan diacak
     * @return kata yang telah diacak
     */
    public static String scramble(String word) {
        if (word == null || word.isEmpty()) {
            return word;
        }
        
        // PERBAIKAN 1: Cek apakah kata bisa diacak.
        // Jika semua karakter sama (misal: "BUKU" memiliki huruf unik B,U,K; "AAA" tidak),
        // atau panjangnya hanya 1, maka tidak bisa diacak.
        long uniqueCharCount = word.chars().distinct().count();
        if (uniqueCharCount <= 1) {
            return word; // Kembalikan apa adanya jika tidak bisa diacak.
        }

        String scrambledWord;
        List<Character> characters = word.chars().mapToObj(c -> (char) c).collect(Collectors.toList());

        // PERBAIKAN 2: Menggunakan loop do-while, bukan rekursi.
        // Ini lebih aman dan tidak akan menyebabkan StackOverflowError.
        do {
            Collections.shuffle(characters);
            StringBuilder sb = new StringBuilder();
            for (Character c : characters) {
                sb.append(c);
            }
            scrambledWord = sb.toString();
        } while (scrambledWord.equals(word)); // Terus acak sampai hasilnya berbeda.

        return scrambledWord;
    }
}
