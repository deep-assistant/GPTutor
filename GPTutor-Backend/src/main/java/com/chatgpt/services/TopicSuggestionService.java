package com.chatgpt.services;

import com.chatgpt.entity.VkUser;
import com.chatgpt.entity.database.TopicSuggestion;
import com.chatgpt.entity.requests.CreateTopicSuggestion;
import com.chatgpt.entity.requests.UpdateTopicSuggestion;
import com.chatgpt.repositories.TopicSuggestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class TopicSuggestionService {
    @Autowired
    UserService userService;

    @Autowired
    TopicSuggestionRepository topicSuggestionRepository;

    public TopicSuggestion createTopicSuggestion(String vkUserId, CreateTopicSuggestion createTopicSuggestion) {
        var user = userService.getOrCreateVkUser(vkUserId);
        return saveTopicSuggestion(
                user,
                createTopicSuggestion.getTitle(),
                createTopicSuggestion.getDescription(),
                createTopicSuggestion.getType()
        );
    }

    public List<TopicSuggestion> getTopicSuggestions(String vkUserId) {
        var user = userService.getOrCreateVkUser(vkUserId);
        return topicSuggestionRepository.findAllByVkUserId(user.getId());
    }

    public List<TopicSuggestion> getAllTopicSuggestions() {
        return (List<TopicSuggestion>) topicSuggestionRepository.findAll();
    }

    public List<TopicSuggestion> getTopicSuggestionsByStatus(TopicSuggestion.SuggestionStatus status) {
        return topicSuggestionRepository.findAllByStatus(status);
    }

    public List<TopicSuggestion> getTopicSuggestionsByType(TopicSuggestion.TopicType type) {
        return topicSuggestionRepository.findAllByType(type);
    }

    public void deleteTopicSuggestion(String vkUserId, UUID topicSuggestionId) {
        var user = userService.getOrCreateVkUser(vkUserId);
        var foundTopicSuggestion = topicSuggestionRepository.findById(topicSuggestionId);

        foundTopicSuggestion.ifPresent(topicSuggestion -> checkAccess(user, topicSuggestion));

        topicSuggestionRepository.deleteById(topicSuggestionId);
    }

    public void updateTopicSuggestion(String vkUserId, UpdateTopicSuggestion updateTopicSuggestion) {
        var user = userService.getOrCreateVkUser(vkUserId);
        var foundTopicSuggestion = topicSuggestionRepository.findById(updateTopicSuggestion.getId());

        foundTopicSuggestion.ifPresent(topicSuggestion -> {
            checkAccess(user, topicSuggestion);

            if (updateTopicSuggestion.getTitle() != null) {
                topicSuggestion.setTitle(updateTopicSuggestion.getTitle());
            }
            if (updateTopicSuggestion.getDescription() != null) {
                topicSuggestion.setDescription(updateTopicSuggestion.getDescription());
            }
            if (updateTopicSuggestion.getType() != null) {
                topicSuggestion.setType(updateTopicSuggestion.getType());
            }
            if (updateTopicSuggestion.getStatus() != null) {
                topicSuggestion.setStatus(updateTopicSuggestion.getStatus());
            }

            topicSuggestionRepository.save(topicSuggestion);
        });
    }

    private void checkAccess(VkUser user, TopicSuggestion topicSuggestion) {
        if (!user.getId().equals(topicSuggestion.getVkUser().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    private TopicSuggestion saveTopicSuggestion(VkUser user, String title, String description, TopicSuggestion.TopicType type) {
        var topicSuggestion = new TopicSuggestion();

        topicSuggestion.setVkUser(user);
        topicSuggestion.setTitle(title);
        topicSuggestion.setDescription(description);
        topicSuggestion.setType(type);

        topicSuggestionRepository.save(topicSuggestion);

        return topicSuggestion;
    }
}