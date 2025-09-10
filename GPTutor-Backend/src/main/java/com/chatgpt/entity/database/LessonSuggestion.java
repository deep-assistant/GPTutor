package com.chatgpt.entity.database;

import com.chatgpt.entity.VkUser;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class LessonSuggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne()
    private VkUser vkUser;

    private String lessonName;

    private String description;

    private String category;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private SuggestionStatus status;

    public enum SuggestionStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    public LessonSuggestion() {
        this.createdAt = LocalDateTime.now();
        this.status = SuggestionStatus.PENDING;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public VkUser getVkUser() {
        return vkUser;
    }

    public void setVkUser(VkUser vkUser) {
        this.vkUser = vkUser;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public SuggestionStatus getStatus() {
        return status;
    }

    public void setStatus(SuggestionStatus status) {
        this.status = status;
    }
}