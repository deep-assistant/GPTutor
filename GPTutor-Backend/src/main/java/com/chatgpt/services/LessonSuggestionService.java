package com.chatgpt.services;

import com.chatgpt.entity.VkUser;
import com.chatgpt.entity.database.LessonSuggestion;
import com.chatgpt.entity.requests.CreateLessonSuggestionRequest;
import com.chatgpt.entity.requests.UpdateLessonSuggestionRequest;
import com.chatgpt.repositories.LessonSuggestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class LessonSuggestionService {
    @Autowired
    UserService userService;

    @Autowired
    LessonSuggestionRepository lessonSuggestionRepository;

    public LessonSuggestion createLessonSuggestion(String vkUserId, CreateLessonSuggestionRequest createLessonSuggestionRequest) {
        var user = userService.getOrCreateVkUser(vkUserId);
        return saveLessonSuggestion(
                user,
                createLessonSuggestionRequest.getLessonName(),
                createLessonSuggestionRequest.getDescription(),
                createLessonSuggestionRequest.getCategory(),
                createLessonSuggestionRequest.getContent()
        );
    }

    public List<LessonSuggestion> getLessonSuggestions(String vkUserId) {
        var user = userService.getOrCreateVkUser(vkUserId);
        return lessonSuggestionRepository.findAllByVkUserId(user.getId());
    }

    public List<LessonSuggestion> getAllLessonSuggestions() {
        return (List<LessonSuggestion>) lessonSuggestionRepository.findAll();
    }

    public List<LessonSuggestion> getLessonSuggestionsByStatus(LessonSuggestion.SuggestionStatus status) {
        return lessonSuggestionRepository.findAllByStatus(status);
    }

    public void deleteLessonSuggestion(String vkUserId, UUID lessonSuggestionId) {
        var user = userService.getOrCreateVkUser(vkUserId);
        var foundLessonSuggestion = lessonSuggestionRepository.findById(lessonSuggestionId);

        foundLessonSuggestion.ifPresent(lessonSuggestion -> checkAccess(user, lessonSuggestion));

        lessonSuggestionRepository.deleteById(lessonSuggestionId);
    }

    public void updateLessonSuggestion(String vkUserId, UpdateLessonSuggestionRequest updateLessonSuggestionRequest) {
        var user = userService.getOrCreateVkUser(vkUserId);
        var foundLessonSuggestion = lessonSuggestionRepository.findById(updateLessonSuggestionRequest.getId());

        foundLessonSuggestion.ifPresent(lessonSuggestion -> {
            checkAccess(user, lessonSuggestion);

            lessonSuggestion.setLessonName(updateLessonSuggestionRequest.getLessonName());
            lessonSuggestion.setDescription(updateLessonSuggestionRequest.getDescription());
            lessonSuggestion.setCategory(updateLessonSuggestionRequest.getCategory());
            lessonSuggestion.setContent(updateLessonSuggestionRequest.getContent());
            
            if (updateLessonSuggestionRequest.getStatus() != null) {
                lessonSuggestion.setStatus(updateLessonSuggestionRequest.getStatus());
            }

            lessonSuggestionRepository.save(lessonSuggestion);
        });
    }

    private void checkAccess(VkUser user, LessonSuggestion lessonSuggestion) {
        if (!user.getId().equals(lessonSuggestion.getVkUser().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    private LessonSuggestion saveLessonSuggestion(VkUser user, String lessonName, String description, String category, String content) {
        var lessonSuggestion = new LessonSuggestion();

        lessonSuggestion.setVkUser(user);
        lessonSuggestion.setLessonName(lessonName);
        lessonSuggestion.setDescription(description);
        lessonSuggestion.setCategory(category);
        lessonSuggestion.setContent(content);

        lessonSuggestionRepository.save(lessonSuggestion);

        return lessonSuggestion;
    }
}