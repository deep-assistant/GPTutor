package com.chatgpt.entity.requests;

import com.chatgpt.entity.database.TopicSuggestion;

public class CreateTopicSuggestion {
    private String title;
    private String description;
    private TopicSuggestion.TopicType type;

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
}