package com.chatgpt.controllers;

import com.chatgpt.entity.database.TopicSuggestion;
import com.chatgpt.entity.requests.CreateTopicSuggestion;
import com.chatgpt.entity.requests.UpdateTopicSuggestion;
import com.chatgpt.services.TopicSuggestionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class TopicSuggestionController {

    @Autowired
    TopicSuggestionService topicSuggestionService;

    @PostMapping(path = "/topic-suggestion")
    public TopicSuggestion createTopicSuggestion(HttpServletRequest request, @RequestBody CreateTopicSuggestion createTopicSuggestion) {
        return topicSuggestionService.createTopicSuggestion((String) request.getAttribute("vkUserId"), createTopicSuggestion);
    }

    @GetMapping(path = "/topic-suggestion")
    public List<TopicSuggestion> getTopicSuggestions(HttpServletRequest request) {
        return topicSuggestionService.getTopicSuggestions((String) request.getAttribute("vkUserId"));
    }

    @GetMapping(path = "/topic-suggestion/all")
    public List<TopicSuggestion> getAllTopicSuggestions() {
        return topicSuggestionService.getAllTopicSuggestions();
    }

    @GetMapping(path = "/topic-suggestion/status/{status}")
    public List<TopicSuggestion> getTopicSuggestionsByStatus(@PathVariable("status") TopicSuggestion.SuggestionStatus status) {
        return topicSuggestionService.getTopicSuggestionsByStatus(status);
    }

    @GetMapping(path = "/topic-suggestion/type/{type}")
    public List<TopicSuggestion> getTopicSuggestionsByType(@PathVariable("type") TopicSuggestion.TopicType type) {
        return topicSuggestionService.getTopicSuggestionsByType(type);
    }

    @DeleteMapping(path = "/topic-suggestion/{id}")
    public void deleteTopicSuggestion(HttpServletRequest request, @PathVariable("id") UUID topicSuggestionId) {
        topicSuggestionService.deleteTopicSuggestion((String) request.getAttribute("vkUserId"), topicSuggestionId);
    }

    @PutMapping(path = "/topic-suggestion")
    public void updateTopicSuggestion(HttpServletRequest request, @RequestBody UpdateTopicSuggestion updateTopicSuggestion) {
        topicSuggestionService.updateTopicSuggestion((String) request.getAttribute("vkUserId"), updateTopicSuggestion);
    }
}