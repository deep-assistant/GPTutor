package com.chatgpt.repositories;

import com.chatgpt.entity.database.TopicSuggestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;

public interface TopicSuggestionRepository extends CrudRepository<TopicSuggestion, UUID> {
    List<TopicSuggestion> findAllByVkUserId(UUID vkUserId);
    Page<TopicSuggestion> findAllByVkUserId(UUID vkUserId, PageRequest pageable);
    List<TopicSuggestion> findAllByStatus(TopicSuggestion.SuggestionStatus status);
    List<TopicSuggestion> findAllByType(TopicSuggestion.TopicType type);
    List<TopicSuggestion> findAllByVkUserIdAndStatus(UUID vkUserId, TopicSuggestion.SuggestionStatus status);
    void deleteAllByVkUserId(UUID vkUserId);
}