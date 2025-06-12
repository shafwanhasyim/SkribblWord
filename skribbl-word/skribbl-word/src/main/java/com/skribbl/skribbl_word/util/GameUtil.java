package com.skribbl.skribbl_word.util;

import com.skribbl.skribbl_word.model.GameDifficulty;
import com.skribbl.skribbl_word.model.Word;
import java.util.*;

/**
 * Kelas utilitas untuk berbagai operasi game
 */
public class GameUtil {

    private static final Random random = new Random();
    
    /**
     * Hitung skor dasar berdasarkan tingkat kesulitan
     * 
     * @param difficulty tingkat kesulitan permainan
     * @return skor dasar
     */    public static int calculateBasePoints(GameDifficulty difficulty) {
        switch (difficulty) {
            case EASY:
                return 10;
            case MEDIUM:
                return 20;
            case HARD:
                return 30;
            case RANDOM:
                // Untuk RANDOM, kita gunakan nilai rata-rata dari semua level
                return 20; // Nilai tengah antara EASY (10) dan HARD (30)
            default:
                return 10;
        }
    }
    
    /**
     * Menghitung skor dasar dari objek Word
     * Digunakan ketika permainan menggunakan mode RANDOM untuk memberikan skor sesuai dengan 
     * tingkat kesulitan kata yang sebenarnya
     * 
     * @param word objek kata yang sedang dimainkan
     * @return skor dasar berdasarkan tingkat kesulitan kata
     */
    public static int calculateBasePointsFromWord(Word word) {
        if (word == null) {
            return 10; // Default ke EASY jika kata null
        }
        
        return calculateBasePoints(word.getDifficulty());
    }
    
    /**
     * Hitung bonus skor berdasarkan streak
     * 
     * @param streakCount jumlah streak
     * @return bonus skor
     */
    public static int calculateStreakBonus(int streakCount) {
        // Maksimal 50 poin bonus (10 streak)
        return Math.min(streakCount - 1, 10) * 5;
    }
    
    /**
     * Hitung bonus waktu berdasarkan sisa waktu
     * 
     * @param timeLeftSeconds sisa waktu dalam detik
     * @return bonus skor
     */
    public static int calculateTimeBonus(long timeLeftSeconds) {
        // Maksimal 20 poin bonus
        return (int) Math.min(timeLeftSeconds / 3, 20);
    }
    
    /**
     * Memberikan petunjuk untuk kata yang sedang ditebak
     * 
     * @param word kata yang sedang ditebak
     * @return petunjuk berupa kata dengan beberapa huruf disamarkan
     */
    public static String getHint(String word) {
        if (word == null || word.isEmpty()) {
            return "";
        }
        
        // Ubah kata menjadi array char
        char[] chars = word.toCharArray();
        
        // Tentukan berapa banyak karakter yang akan disamarkan (40-60% dari panjang kata)
        int maskCount = (int) (chars.length * (0.4 + random.nextDouble() * 0.2));
        
        // Pilih indeks acak untuk disamarkan
        Set<Integer> maskIndices = new HashSet<>();
        while (maskIndices.size() < maskCount) {
            maskIndices.add(random.nextInt(chars.length));
        }
        
        // Samarkan karakter yang terpilih
        StringBuilder hint = new StringBuilder();
        for (int i = 0; i < chars.length; i++) {
            if (maskIndices.contains(i)) {
                hint.append('_');
            } else {
                hint.append(chars[i]);
            }
        }
        
        return hint.toString();
    }
    
    /**
     * Mengacak urutan elemen dalam array atau list
     * 
     * @param <T> tipe elemen
     * @param array array yang akan diacak
     */
    public static <T> void shuffleArray(T[] array) {
        for (int i = array.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            T temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    
    /**
     * Mengambil elemen acak dari daftar
     * 
     * @param <T> tipe elemen
     * @param list daftar elemen
     * @return elemen acak dari list
     */
    public static <T> T getRandomElement(List<T> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        return list.get(random.nextInt(list.size()));
    }
}
