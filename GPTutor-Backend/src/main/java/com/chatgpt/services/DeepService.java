package com.chatgpt.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class DeepService {
//     @Value("${master-token}")
//     String masterToken;


//     @Value("${deep-url}")
//     String deepUrl;

    public String getUserId() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        HttpServletRequest request = attributes.getRequest();

        if (request.getAttribute("isTG").equals(true)) {
            return request.getAttribute("vkUserId").toString().substring(2);
        }

        return "VK" + request.getAttribute("vkUserId").toString();
    }

    public void updateUserToken(String operation, int amount) {
        String userId = this.getUserId();

        String url = String.format( "/token?userId=%s&masterToken=%s", userId, "");
        System.out.println(url);

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String requestBody = String.format("{\"operation\": \"%s\", \"amount\": %d}", operation, amount);

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
    }

    public String getUserToken() {
        String userId = this.getUserId();
        System.out.println(userId);

        String url = String.format("/token?userId=%s&masterToken=%s", userId, "");
        System.out.println(url);

        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<String> responseEntity = restTemplate.getForEntity(url, String.class);
        return responseEntity.getBody();
    }

    public boolean hasUser() {
        String userId = this.getUserId();

        String url = String.format("/token/has?userId=%s&masterToken=%s", userId, "");

        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<String> responseEntity = restTemplate.getForEntity(url, String.class);
        String responseBody = responseEntity.getBody();

        ObjectMapper mapper = new ObjectMapper();

        try {
            JsonNode jsonMap = mapper.readTree(responseBody);

            return jsonMap.get("hasUser").asBoolean();
        } catch (Exception e) {
            return false;
        }
    }

    String getAdminToken() {
        String userId = this.getUserId();

        String url = String.format("/token?userId=%s&masterToken=%s", userId, "");

        RestTemplate restTemplate = new RestTemplate();

        ResponseEntity<String> responseEntity = restTemplate.getForEntity(url, String.class);

        String responseBody = responseEntity.getBody();

        ObjectMapper mapper = new ObjectMapper();

        try {
            JsonNode jsonMap = mapper.readTree(responseBody);

            return jsonMap.get("id").asText();
        } catch (Exception e) {
            return "";
        }
    }
}
