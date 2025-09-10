package com.chatgpt.controllers;

import com.chatgpt.entity.CreateHistoryRequest;
import com.chatgpt.entity.History;
import com.chatgpt.repositories.MessageRepository;
import com.chatgpt.services.HistoryService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
public class HistoryController {

    @Autowired
    HistoryService historyService;

    @Autowired
    MessageRepository messageRepository;

    @PostMapping(path = "/history")
    @RateLimiter(name = "historyLimit", fallbackMethod = "fallbackMethod")
    public ResponseEntity<History> createHistory(HttpServletRequest request, @RequestBody CreateHistoryRequest createHistoryRequest) throws Exception {
        return ResponseEntity.ok().body(historyService.createHistory((String) request.getAttribute("vkUserId"), createHistoryRequest));
    }


    @GetMapping(path = "/history")
    @RateLimiter(name = "historyLimit", fallbackMethod = "fallbackMethod")
    public ResponseEntity<Page<History>> getHistoryById(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String lessonName,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo
    ) {
        return ResponseEntity.ok().body(
                historyService.getAllHistory((String) request.getAttribute("vkUserId"),
                        search,
                        type,
                        lessonName,
                        dateFrom,
                        dateTo,
                        pageNumber,
                        pageSize
                )
        );
    }

    @DeleteMapping(path = "/history/{id}")
    @RateLimiter(name = "historyLimit", fallbackMethod = "fallbackMethod")
    @Transactional
    public ResponseEntity<String> deleteHistory(HttpServletRequest request, @PathVariable("id") UUID historyId) {
        historyService.deleteHistory((String) request.getAttribute("vkUserId"), historyId);

        return ResponseEntity.ok().body("{}");
    }

    @DeleteMapping(path = "/history")
    @RateLimiter(name = "historyLimit", fallbackMethod = "fallbackMethod")
    @Transactional
    public ResponseEntity<String> deleteHistory(HttpServletRequest request) {
        historyService.deleteAllHistory((String) request.getAttribute("vkUserId"));

        return ResponseEntity.ok().body("{}");
    }

    @PutMapping(path = "/history")
    @RateLimiter(name = "historyLimit", fallbackMethod = "fallbackMethod")
    @Transactional
    public ResponseEntity<Boolean> updateHistory(@RequestBody History history, HttpServletRequest request) {
        return ResponseEntity.ok().body(historyService.updateHistory((String) request.getAttribute("vkUserId"), history));
    }

    public ResponseEntity<Object> fallbackMethod(Exception e) throws Exception {
        if (e != null) throw e;

        throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many requests");
    }
}
