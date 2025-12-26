package com.example.timetable.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    // We will grab the Google Apps Script URL from your Render environment variables
    @Value("${GOOGLE_SCRIPT_URL:}")
    private String googleScriptUrl;

    public void sendEmail(String to, String subject, String body) {
        if (googleScriptUrl == null || googleScriptUrl.trim().isEmpty()) {
            logger.warn("=========================================================");
            logger.warn("Local Development Mode: GOOGLE_SCRIPT_URL is not set.");
            logger.warn("Simulating sending email to {} with subject: {}", to, subject);
            logger.warn("Email Body:\n{}", body);
            logger.warn("=========================================================");
            return;
        }

        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("to", to);
            payload.put("subject", subject);
            payload.put("body", body);

            ObjectMapper mapper = new ObjectMapper();
            String jsonPayload = mapper.writeValueAsString(payload);

            HttpClient client = HttpClient.newBuilder()
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .build();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(googleScriptUrl.trim()))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String responseBody = response.body();

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                 if (responseBody.contains("\"error\"") || responseBody.contains("accounts.google.com") || responseBody.toLowerCase().contains("html")) {
                     logger.error("App Script Execution Failed. Response from Google: {}", responseBody);
                     throw new RuntimeException("App Script failed: " + responseBody.substring(0, Math.min(responseBody.length(), 100)));
                 }
                 logger.info("Email sent successfully via Google Apps Script to: {}", to);
            } else {
                 logger.error("Failed to send email. HTTP Status: {}. Response: {}", response.statusCode(), responseBody);
                 throw new RuntimeException("Failed to send email via App Script. Status: " + response.statusCode());
            }

        } catch (Exception e) {
            logger.error("Error sending email over HTTP: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send email. Please try again later. (" + e.getMessage() + ")");
        }
    }

    public void sendPasswordResetEmail(String email, String otp) {
        String subject = "Password Reset OTP - AEMS";
        String body = "You requested a password reset for your AEMS account.\n\n" +
                "Your 6-digit OTP is:\n\n" +
                "   " + otp + "\n\n" +
                "This OTP will expire in 10 minutes.\n\n" +
                "If you did not request a password reset, please ignore this email.\n\n" +
                "-- AEMS Team";
        sendEmail(email, subject, body);
    }
}
