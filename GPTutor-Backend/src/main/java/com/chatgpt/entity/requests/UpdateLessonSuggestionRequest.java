package com.chatgpt.entity.requests;

import com.chatgpt.entity.database.LessonSuggestion;

import java.util.UUID;

public class UpdateLessonSuggestionRequest {
    private UUID id;
    private String lessonName;
    private String description;
    private String category;
    private String content;
    private LessonSuggestion.SuggestionStatus status;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getLessonName() {
        return lessonName;
    }

    public void setLessonName(String lessonName) {
        this.lessonName = lessonName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LessonSuggestion.SuggestionStatus getStatus() {
        return status;
    }

    public void setStatus(LessonSuggestion.SuggestionStatus status) {
        this.status = status;
    }
}