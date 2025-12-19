package com.example.timetable.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class HomeController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }


    @GetMapping("/")
    public String home() {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<title>Timetable Backend</title>" +
                "<style>" +
                "body { " +
                "  display: flex; " +
                "  flex-direction: row; " +
                "  justify-content: center; " +
                "  align-items: center; " +
                "  height: 100vh; " +
                "  margin: 0; " +
                "  background-color: #ffffff; " +
                "  gap: 15px; " +
                "}" +
                ".icon { " +
                "  display: flex; " +
                "  align-items: center; " +
                "  justify-content: center; " +
                "  width: 50px; " +
                "  height: 50px; " +
                "  background-color: #e6f9ee; " +
                "  border-radius: 12px; " +
                "  color: #22c55e; " +
                "}" +
                ".icon svg { " +
                "  width: 28px; " +
                "  height: 28px; " +
                "}" +
                ".message { " +
                "  font-size: 1.5rem; " +
                "  margin: 0; " +
                "  color: #000000; " +
                "}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='message'>Timetable Backend is successfully running!</div>" +
                "  <div class='icon'>" +
                "    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle><line x1='2' y1='12' x2='22' y2='12'></line><path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'></path></svg>"
                +
                "  </div>" +
                "</body>" +
                "</html>";
    }
}
