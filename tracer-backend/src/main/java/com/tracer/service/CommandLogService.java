package com.tracer.service;

import com.tracer.entity.CommandLog;
import com.tracer.repository.CommandLogRepository;
import com.tracer.util.CommandLineParser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommandLogService {
    
    private final CommandLogRepository commandLogRepository;
    private final CommandLineParser commandLineParser;
    
    @Transactional
    public void loadLogsFromFile(Path filePath, int batchSize) throws IOException {
        try (BufferedReader reader = Files.newBufferedReader(filePath)) {
            List<CommandLog> batch = new ArrayList<>();
            int lineNum = 0;
            
            String line;
            while ((line = reader.readLine()) != null) {
                lineNum++;
                try {
                    CommandLineParser.ParsedCommand parsed = commandLineParser.parseCommandLine(line);
                    if (parsed != null) {
                        // Check if log already exists
                        boolean exists = commandLogRepository.findByTimestampBetweenOrderByTimestampDesc(
                            parsed.getTimestamp().minusSeconds(1),
                            parsed.getTimestamp().plusSeconds(1)
                        ).stream()
                        .anyMatch(log -> log.getUser().equals(parsed.getUser()) && 
                                       log.getCommand().equals(parsed.getCommand()));
                        
                        if (!exists) {
                            CommandLog log = new CommandLog();
                            log.setTimestamp(parsed.getTimestamp());
                            log.setDate(parsed.getDate());
                            log.setTime(parsed.getTime());
                            log.setUser(parsed.getUser());
                            log.setDirectory(parsed.getDirectory());
                            log.setCommand(parsed.getCommand());
                            log.setRawLine(parsed.getRawLine());
                            
                            batch.add(log);
                            
                            if (batch.size() >= batchSize) {
                                commandLogRepository.saveAll(batch);
                                batch.clear();
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error parsing line " + lineNum + ": " + e.getMessage());
                }
            }
            
            if (!batch.isEmpty()) {
                commandLogRepository.saveAll(batch);
            }
        }
    }
    
    public Map<String, Object> getLogs(String startDate, String endDate, String user,
                                      String search, String directory, int limit, int offset) {
        List<CommandLog> logs;
        long total;
        
        LocalDateTime start = startDate != null ? 
            LocalDate.parse(startDate).atStartOfDay() : null;
        LocalDateTime end = endDate != null ? 
            LocalDate.parse(endDate).atTime(23, 59, 59).plusDays(1) : null;
        
        if (start != null && end != null) {
            logs = commandLogRepository.findByTimestampBetweenOrderByTimestampDesc(start, end);
        } else if (start != null) {
            logs = commandLogRepository.findByTimestampBetweenOrderByTimestampDesc(
                start, LocalDateTime.now());
        } else {
            logs = commandLogRepository.findAll();
        }
        
        // Apply filters
        if (user != null) {
            logs = logs.stream()
                .filter(log -> log.getUser().equals(user))
                .collect(Collectors.toList());
        }
        if (directory != null) {
            logs = logs.stream()
                .filter(log -> log.getDirectory().contains(directory))
                .collect(Collectors.toList());
        }
        if (search != null) {
            logs = logs.stream()
                .filter(log -> log.getCommand().contains(search))
                .collect(Collectors.toList());
        }
        
        total = logs.size();
        
        // Apply pagination
        int fromIndex = Math.min(offset, logs.size());
        int toIndex = Math.min(offset + limit, logs.size());
        logs = logs.subList(fromIndex, toIndex);
        
        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        result.put("limit", limit);
        result.put("offset", offset);
        result.put("logs", logs);
        return result;
    }
    
    public List<Map<String, Object>> getLogsByDate() {
        return commandLogRepository.findLogsByDate().stream()
            .map(result -> {
                Map<String, Object> item = new HashMap<>();
                item.put("date", result[0]);
                item.put("count", result[1]);
                return item;
            })
            .collect(Collectors.toList());
    }
    
    public Map<String, Object> getLogStats() {
        long totalLogs = commandLogRepository.count();
        List<CommandLog> allLogs = commandLogRepository.findAll();
        
        LocalDateTime firstLog = allLogs.stream()
            .map(CommandLog::getTimestamp)
            .min(LocalDateTime::compareTo)
            .orElse(null);
        LocalDateTime lastLog = allLogs.stream()
            .map(CommandLog::getTimestamp)
            .max(LocalDateTime::compareTo)
            .orElse(null);
        
        Long uniqueUsers = commandLogRepository.countDistinctUsers();
        
        List<Object[]> mostActiveUserResult = commandLogRepository.findMostActiveUser();
        Map<String, Object> mostActiveUser = new HashMap<>();
        if (!mostActiveUserResult.isEmpty()) {
            mostActiveUser.put("user", mostActiveUserResult.get(0)[0]);
            mostActiveUser.put("count", mostActiveUserResult.get(0)[1]);
        }
        
        List<Object[]> topCommandsResult = commandLogRepository.findTopCommands(10);
        List<Object[]> topCommands = topCommandsResult != null ? topCommandsResult : List.of();
        List<Map<String, Object>> topCommandsList = topCommands.stream()
            .map(cmd -> {
                Map<String, Object> item = new HashMap<>();
                String command = (String) cmd[0];
                item.put("command", command.length() > 50 ? command.substring(0, 50) : command);
                item.put("count", cmd[1]);
                return item;
            })
            .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("total_logs", totalLogs);
        Map<String, Object> dateRange = new HashMap<>();
        dateRange.put("first_log", firstLog != null ? firstLog.toString() : null);
        dateRange.put("last_log", lastLog != null ? lastLog.toString() : null);
        result.put("date_range", dateRange);
        result.put("unique_users", uniqueUsers);
        result.put("most_active_user", mostActiveUser);
        result.put("top_commands", topCommandsList);
        return result;
    }
    
    public Map<String, List<String>> getFilterOptions() {
        Map<String, List<String>> result = new HashMap<>();
        result.put("users", commandLogRepository.findDistinctUsers());
        result.put("directories", commandLogRepository.findDistinctDirectories());
        return result;
    }
    
    public List<CommandLog> getLogsForDate(String date) {
        LocalDate dateObj = LocalDate.parse(date);
        LocalDateTime start = dateObj.atStartOfDay();
        LocalDateTime end = dateObj.atTime(23, 59, 59).plusDays(1);
        return commandLogRepository.findByDateRange(start, end);
    }
}

