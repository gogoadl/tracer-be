package com.tracer.controller;

import com.tracer.service.CommandLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/reload-logs", "/api/reload-logs"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReloadLogsController {
    
    private final CommandLogService commandLogService;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> reloadLogs() {
        String commandHistoryPath = System.getenv("COMMAND_HISTORY_PATH");
        if (commandHistoryPath == null || commandHistoryPath.isEmpty()) {
            commandHistoryPath = System.getProperty("user.home") + "/.command_log.jsonl";
        }
        
        Path path = Paths.get(commandHistoryPath);
        
        if (!Files.exists(path)) {
            Map<String, Object> error = new HashMap<>();
            error.put("detail", "Command history file not found at " + commandHistoryPath);
            return ResponseEntity.status(404).body(error);
        }
        
        try {
            commandLogService.loadLogsFromFile(path, 1000);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Logs reloaded successfully");
            result.put("source", commandHistoryPath);
            result.put("path", commandHistoryPath);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("detail", "Error reloading logs: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}

