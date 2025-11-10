package com.chatgpt.services;

import com.chatgpt.entity.ChatGptRequest;
import com.chatgpt.entity.ConversationRequest;
import com.chatgpt.entity.requests.QuestionRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;

@Service
public class ConversationsService {
    @Autowired
    DeepService deepService;

    @Value("${models.url}")
    String modelsUrl;

    @Value("${rag.url}")
    String ragUrl;

//     @Value("${master-token}")
//     String masterToken;

//     @Value("${deep-url}")
//     String deepUrl;

    @Autowired
    ApiRequestsService apiRequestsService;

    @Autowired
    ApiKeysService apiKeysService;

    @Autowired
    SubscriptionsImagesService subscriptionsImagesService;

    public SseEmitter getConversation(ConversationRequest conversationRequest, String userId) throws IOException {
        Utf8SseEmitter emitter = new Utf8SseEmitter();

        fetchCompletion(emitter, conversationRequest, userId, 0);

        return emitter;
    }



    public void fetchCompletion(Utf8SseEmitter emitter, ConversationRequest conversationRequest, String userId, int attempt) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();


        ChatGptRequest chatGptRequest = new ChatGptRequest(
                conversationRequest.getModel(),
                conversationRequest.getMessages(),
                true
        );

        var apiKey = deepService.getAdminToken();

        String input = mapper.writeValueAsString(chatGptRequest);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(input))
                .build();

        HttpClient.newHttpClient().sendAsync(request, respInfo ->
        {
            System.out.println(respInfo.statusCode());
            if (respInfo.statusCode() == 200) {
                return new SseSubscriber((data) -> {
                    SseEmitter.SseEventBuilder event = SseEmitter.event()
                            .data(data);

                    if (data.equals("[DONE]")) emitter.complete();
                    try {
                        emitter.send(event);
                    } catch (IOException e) {
                        emitter.completeWithError(e);
                    }
                });
            }

            try {
                if (attempt == 100) {
                    emitter.send("[Error]:[" + respInfo.statusCode() + "]");
                    emitter.complete();
                    return null;
                }

                Thread.sleep(200);
                fetchCompletion(emitter, conversationRequest, userId, attempt + 1);
            } catch (IOException | InterruptedException e) {
                emitter.completeWithError(e);
            }


            return null;
        });
    }

    public String getConversationVKDoc(QuestionRequest questionRequest) {
        RestTemplate restTemplate = new RestTemplate();

        String url = ragUrl + "/doc-question";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        HttpEntity<QuestionRequest> requestEntity = new HttpEntity<>(questionRequest, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                String.class
        );

        return response.getBody();
    }
};
