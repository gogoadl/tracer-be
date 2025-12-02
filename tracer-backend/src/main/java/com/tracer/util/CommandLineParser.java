package com.tracer.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.regex.Pattern;

@Component
public class CommandLineParser {
    private static final Pattern TEXT_PATTERN = Pattern.compile(
        "(\\d{4}-\\d{2}-\\d{2})\\s+(\\d{2}:\\d{2}:\\d{2})\\s+\\[([^\\]]+)\\]\\s+(.*?):\\s+(.+)$"
    );
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public ParsedCommand parseCommandLine(String line) {
        if (line == null || line.trim().isEmpty()) {
            return null;
        }
        
        line = line.trim();
        
        // Try to parse as JSON Lines
        if (line.startsWith("{")) {
            return parseJsonLine(line);
        }
        
        // Try to parse as plain text format
        return parseTextLine(line);
    }
    
    private ParsedCommand parseJsonLine(String line) {
        try {
            JsonNode data = objectMapper.readTree(line);
            
            LocalDateTime timestamp;
            if (data.has("timestamp") && data.get("timestamp").isTextual()) {
                String timestampStr = data.get("timestamp").asText().replace("Z", "+00:00");
                timestamp = LocalDateTime.parse(timestampStr, DateTimeFormatter.ISO_DATE_TIME);
            } else if (data.has("date") && data.has("time")) {
                String dateStr = data.get("date").asText();
                String timeStr = data.get("time").asText();
                timestamp = LocalDateTime.parse(dateStr + " " + timeStr, 
                    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            } else {
                timestamp = LocalDateTime.now();
            }
            
            return new ParsedCommand(
                timestamp,
                timestamp.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                timestamp.format(DateTimeFormatter.ofPattern("HH:mm:ss")),
                data.has("user") ? data.get("user").asText() : 
                    (data.has("username") ? data.get("username").asText() : "unknown"),
                data.has("directory") ? data.get("directory").asText() : 
                    (data.has("cwd") ? data.get("cwd").asText() : ""),
                data.has("command") ? data.get("command").asText() : "",
                line
            );
        } catch (Exception e) {
            System.err.println("Error parsing JSON line: " + e.getMessage());
            return null;
        }
    }
    
    private ParsedCommand parseTextLine(String line) {
        var matcher = TEXT_PATTERN.matcher(line);
        if (matcher.matches()) {
            String dateStr = matcher.group(1);
            String timeStr = matcher.group(2);
            String user = matcher.group(3);
            String directory = matcher.group(4);
            String command = matcher.group(5);
            
            LocalDateTime timestamp = LocalDateTime.parse(
                dateStr + " " + timeStr,
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
            );
            
            return new ParsedCommand(
                timestamp,
                dateStr,
                timeStr,
                user,
                directory,
                command,
                line
            );
        }
        
        return null;
    }
    
    public static class ParsedCommand {
        private final LocalDateTime timestamp;
        private final String date;
        private final String time;
        private final String user;
        private final String directory;
        private final String command;
        private final String rawLine;
        
        public ParsedCommand(LocalDateTime timestamp, String date, String time,
                           String user, String directory, String command, String rawLine) {
            this.timestamp = timestamp;
            this.date = date;
            this.time = time;
            this.user = user;
            this.directory = directory;
            this.command = command;
            this.rawLine = rawLine;
        }
        
        // Getters
        public LocalDateTime getTimestamp() { return timestamp; }
        public String getDate() { return date; }
        public String getTime() { return time; }
        public String getUser() { return user; }
        public String getDirectory() { return directory; }
        public String getCommand() { return command; }
        public String getRawLine() { return rawLine; }
    }
}

