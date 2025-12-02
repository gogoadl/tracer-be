package com.tracer.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/config", "/api/config"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ConfigController {
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getConfig() {
        String commandHistoryPath = System.getenv("COMMAND_HISTORY_PATH");
        if (commandHistoryPath == null || commandHistoryPath.isEmpty()) {
            commandHistoryPath = System.getProperty("user.home") + "/.command_log.jsonl";
        }
        
        Path path = Paths.get(commandHistoryPath);
        Map<String, Object> result = new HashMap<>();
        result.put("command_history_path", commandHistoryPath);
        result.put("command_history_exists", Files.exists(path));
        result.put("config", new HashMap<>());
        return ResponseEntity.ok(result);
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> updateConfig(@RequestBody Map<String, Object> configData) {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Configuration updated successfully");
        result.put("config", configData);
        result.put("note", "Please restart the backend for changes to take effect");
        return ResponseEntity.ok(result);
    }
}

