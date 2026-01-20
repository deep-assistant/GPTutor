package com.chatgpt.entity.requests;

import com.chatgpt.entity.database.TopicSuggestion;

import java.util.UUID;

public class UpdateTopicSuggestion {
    private UUID id;
    private String title;
    private String description;
    private TopicSuggestion.TopicType type;
    private TopicSuggestion.SuggestionStatus status;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TopicSuggestion.TopicType getType() {
        return type;
    }

    public void setType(TopicSuggestion.TopicType type) {
        this.type = type;
    }

    public TopicSuggestion.SuggestionStatus getStatus() {
        return status;
    }

    public void setStatus(TopicSuggestion.SuggestionStatus status) {
        this.status = status;
    }
}