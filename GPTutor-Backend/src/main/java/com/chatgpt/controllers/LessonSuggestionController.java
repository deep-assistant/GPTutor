package com.chatgpt.controllers;

import com.chatgpt.entity.database.LessonSuggestion;
import com.chatgpt.entity.requests.CreateLessonSuggestionRequest;
import com.chatgpt.entity.requests.UpdateLessonSuggestionRequest;
import com.chatgpt.services.LessonSuggestionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class LessonSuggestionController {

    @Autowired
    LessonSuggestionService lessonSuggestionService;

    @PostMapping(path = "/lesson-suggestion")
    public LessonSuggestion createLessonSuggestion(HttpServletRequest request, @RequestBody CreateLessonSuggestionRequest createLessonSuggestionRequest) {
        return lessonSuggestionService.createLessonSuggestion((String) request.getAttribute("vkUserId"), createLessonSuggestionRequest);
    }

    @GetMapping(path = "/lesson-suggestion")
    public List<LessonSuggestion> getLessonSuggestions(HttpServletRequest request) {
        return lessonSuggestionService.getLessonSuggestions((String) request.getAttribute("vkUserId"));
    }

    @GetMapping(path = "/lesson-suggestion/all")
    public List<LessonSuggestion> getAllLessonSuggestions() {
        return lessonSuggestionService.getAllLessonSuggestions();
    }

    @GetMapping(path = "/lesson-suggestion/status/{status}")
    public List<LessonSuggestion> getLessonSuggestionsByStatus(@PathVariable("status") LessonSuggestion.SuggestionStatus status) {
        return lessonSuggestionService.getLessonSuggestionsByStatus(status);
    }

    @DeleteMapping(path = "/lesson-suggestion/{id}")
    public void deleteLessonSuggestion(HttpServletRequest request, @PathVariable("id") UUID lessonSuggestionId) {
        lessonSuggestionService.deleteLessonSuggestion((String) request.getAttribute("vkUserId"), lessonSuggestionId);
    }

    @PutMapping(path = "/lesson-suggestion")
    public void updateLessonSuggestion(HttpServletRequest request, @RequestBody UpdateLessonSuggestionRequest updateLessonSuggestionRequest) {
        lessonSuggestionService.updateLessonSuggestion((String) request.getAttribute("vkUserId"), updateLessonSuggestionRequest);
    }
}