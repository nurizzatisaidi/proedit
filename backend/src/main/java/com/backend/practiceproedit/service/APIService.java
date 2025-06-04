package com.backend.practiceproedit.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.json.JSONObject;

import java.util.Collections;
import org.json.JSONArray;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class APIService {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    public String generateTitle(Map<String, String> userInput) {
        String apiUrl = "https://api.openai.com/v1/chat/completions";
        RestTemplate restTemplate = new RestTemplate();

        JSONObject message = new JSONObject();
        message.put("role", "user");
        message.put("content",
                "Based on the following details, suggest a structured, creative, and professional title for a video editing request. Return only ONE title.\n\n"
                        +
                        "Rough Title: " + userInput.get("title") + "\n" +
                        "Video Type: " + userInput.get("videoType") + "\n" +
                        "Notes: " + userInput.get("notes"));

        JSONObject requestBody = new JSONObject();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("messages", Collections.singletonList(message));
        requestBody.put("temperature", 0.9);
        requestBody.put("top_p", 0.95);
        requestBody.put("n", 3); // 3 variations

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);

        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

        JSONObject responseJson = new JSONObject(response.getBody());
        JSONArray choices = responseJson.getJSONArray("choices");
        List<String> suggestions = new ArrayList<>();

        for (int i = 0; i < choices.length(); i++) {
            String suggestion = choices.getJSONObject(i)
                    .getJSONObject("message")
                    .getString("content")
                    .trim();
            suggestions.add(suggestion);
        }

        return String.join("|||", suggestions);
    }

}
