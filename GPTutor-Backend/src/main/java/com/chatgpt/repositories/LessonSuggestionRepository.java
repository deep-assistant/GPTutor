package com.chatgpt.repositories;

import com.chatgpt.entity.database.LessonSuggestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;

public interface LessonSuggestionRepository extends CrudRepository<LessonSuggestion, UUID> {
    List<LessonSuggestion> findAllByVkUserId(UUID vkId);
    Page<LessonSuggestion> findAllByVkUserId(UUID vkId, PageRequest pageable);
    List<LessonSuggestion> findAllByStatus(LessonSuggestion.SuggestionStatus status);
    void deleteAllByVkUserId(UUID vkId);
}