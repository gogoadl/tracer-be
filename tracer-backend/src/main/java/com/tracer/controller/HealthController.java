package com.tracer.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class HealthController {
    
    @GetMapping("/")
    public ResponseEntity<Map<String, String>> root() {
        Map<String, String> result = new HashMap<>();
        result.put("message", "Tracer Backend API");
        result.put("version", "1.0.0");
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> result = new HashMap<>();
        result.put("status", "healthy");
        return ResponseEntity.ok(result);
    }
}

