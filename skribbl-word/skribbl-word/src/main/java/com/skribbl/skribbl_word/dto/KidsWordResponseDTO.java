package com.skribbl.skribbl_word.dto;

import java.util.List;
import java.util.UUID;

/**
 * DTO untuk mengirimkan data kata khusus untuk mode anak
 */
public record KidsWordResponseDTO(UUID wordId, String imageUrl, List<Character> letters) {
}
