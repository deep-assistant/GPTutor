package com.chatgpt.services;

import com.chatgpt.entity.CreateHistoryRequest;
import com.chatgpt.entity.History;
import com.chatgpt.repositories.HistoryRepository;
import com.chatgpt.repositories.MessageRepository;
import com.chatgpt.repositories.VkUsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
public class HistoryService {

    @Autowired
    UserService userService;

    @Autowired
    VkUsersRepository vkUsersRepository;

    @Autowired
    HistoryRepository historyRepository;

    @Autowired
    MessageRepository messageRepository;

    public History createHistory(String vkUserId, CreateHistoryRequest createHistoryRequest) {
        var user = userService.getOrCreateVkUser(vkUserId);

        var history = new History(
                user,
                createHistoryRequest.getLastMessage(),
                createHistoryRequest.getType(),
                createHistoryRequest.getSystemMessage(),
                createHistoryRequest.getLessonName(),
                createHistoryRequest.getLastUpdated(),
                createHistoryRequest.getTitle()
        );

        historyRepository.save(history);

        return history;
    }


    public Page<History> getAllHistory(String vkUserId, String substring, String type, String lessonName, String dateFrom, String dateTo, int pageNumber, int pageSize) {
        PageRequest pageable = PageRequest.of(pageNumber, pageSize, Sort.by("lastUpdated").descending());
        var user = userService.getOrCreateVkUser(vkUserId);
        return historyRepository.findByVkUserIdWithFilters(user.getId(), substring, type, lessonName, dateFrom, dateTo, pageable);
    }

    public Page<History> getAllHistory(String vkUserId, String substring, int pageNumber, int pageSize) {
        return getAllHistory(vkUserId, substring, null, null, null, null, pageNumber, pageSize);
    }

    public void deleteHistory(String vkUserId, UUID historyId) {
        checkHistory(vkUserId, historyId);

        messageRepository.deleteAllByHistoryId(historyId);
        historyRepository.deleteById(historyId);
    }

    public void deleteAllHistory(String vkUserId) {
        var user = userService.getOrCreateVkUser(vkUserId);
        var histories = historyRepository.findAllByVkUserId(user.getId(), PageRequest.of(0, Integer.MAX_VALUE));
        var messages = messageRepository.findByHistoryIdIn(histories.get().map(History::getId).toList());

        messageRepository.deleteAll(messages);
        historyRepository.deleteAllByVkUserId(user.getId());
    }

    private void checkHistory(String vkUserId, UUID historyId) {
        var user = userService.getOrCreateVkUser(vkUserId);
        var foundHistory = historyRepository.findById(historyId);
        if (foundHistory.isPresent()) {
            if (user.getId() != foundHistory.get().getVkUser().getId()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN);
            }
        }
    }

    public Boolean updateHistory(String vkUserId, History history) {
        checkHistory(vkUserId, history.getId());

        historyRepository.save(history);

        return true;
    }
}
