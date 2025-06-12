package com.skribbl.skribbl_word.dto;

import java.util.UUID;

/**
 * DTO untuk menerima jawaban dari mode anak
 */
public record CheckAnswerRequestDTO(UUID wordId, String submittedAnswer) {
}
