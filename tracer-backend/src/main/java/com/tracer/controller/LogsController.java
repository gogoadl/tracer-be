package com.tracer.controller;

import com.tracer.entity.CommandLog;
import com.tracer.service.CommandLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LogsController {
    
    private final CommandLogService commandLogService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getLogs(
            @RequestParam(required = false) String start_date,
            @RequestParam(required = false) String end_date,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String directory,
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        
        Map<String, Object> result = commandLogService.getLogs(
            start_date, end_date, user, search, directory, limit, offset);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/by-date")
    public ResponseEntity<Map<String, Object>> getLogsByDate() {
        List<Map<String, Object>> logsByDate = commandLogService.getLogsByDate();
        Map<String, Object> result = new HashMap<>();
        result.put("logs_by_date", logsByDate);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getLogStats() {
        return ResponseEntity.ok(commandLogService.getLogStats());
    }
    
    @GetMapping("/filter-options")
    public ResponseEntity<Map<String, List<String>>> getFilterOptions() {
        return ResponseEntity.ok(commandLogService.getFilterOptions());
    }
    
    @GetMapping("/date/{date}")
    public ResponseEntity<Map<String, Object>> getLogsForDate(@PathVariable String date) {
        List<CommandLog> logs = commandLogService.getLogsForDate(date);
        Map<String, Object> result = new HashMap<>();
        result.put("date", date);
        result.put("count", logs.size());
        result.put("logs", logs);
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshLogs() {
        // This will be implemented with configuration service
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Logs refresh endpoint - to be implemented with config service");
        return ResponseEntity.ok(result);
    }
}

