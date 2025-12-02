package com.tracer.service;

import com.tracer.entity.FileChange;
import com.tracer.entity.WatchFolder;
import com.tracer.repository.FileChangeRepository;
import com.tracer.repository.WatchFolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileWatchService {
    
    private final FileChangeRepository fileChangeRepository;
    private final WatchFolderRepository watchFolderRepository;
    
    public List<WatchFolder> getAllWatchFolders() {
        return watchFolderRepository.findAll();
    }
    
    @Transactional
    public WatchFolder addWatchFolder(String path, String filePatterns, boolean recursive) {
        WatchFolder existing = watchFolderRepository.findByPath(path);
        if (existing != null) {
            throw new RuntimeException("Path is already being watched");
        }
        
        WatchFolder folder = new WatchFolder();
        folder.setPath(path);
        folder.setIsActive("True");
        folder.setFilePatterns(filePatterns);
        folder.setRecursive(recursive ? "True" : "False");
        folder.setCreatedAt(LocalDateTime.now());
        
        return watchFolderRepository.save(folder);
    }
    
    @Transactional
    public void removeWatchFolder(Integer folderId) {
        watchFolderRepository.deleteById(folderId);
    }
    
    @Transactional
    public WatchFolder toggleWatchFolder(Integer folderId) {
        WatchFolder folder = watchFolderRepository.findById(folderId)
            .orElseThrow(() -> new RuntimeException("Folder not found"));
        
        folder.setIsActive(folder.getIsActive().equals("True") ? "False" : "True");
        return watchFolderRepository.save(folder);
    }
    
    public Map<String, Object> getFileChanges(String startDate, String endDate,
                                             String eventType, String fileExtension,
                                             int limit, int offset) {
        List<FileChange> changes;
        
        if (startDate != null && endDate != null) {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59).plusDays(1);
            changes = fileChangeRepository.findByTimestampBetweenOrderByTimestampDesc(start, end);
        } else {
            changes = fileChangeRepository.findAll();
        }
        
        if (eventType != null) {
            changes = changes.stream()
                .filter(c -> c.getEventType().equals(eventType))
                .collect(Collectors.toList());
        }
        
        if (fileExtension != null) {
            changes = changes.stream()
                .filter(c -> fileExtension.equals(c.getFileExtension()))
                .collect(Collectors.toList());
        }
        
        long total = changes.size();
        
        int fromIndex = Math.min(offset, changes.size());
        int toIndex = Math.min(offset + limit, changes.size());
        changes = changes.subList(fromIndex, toIndex);
        
        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        result.put("limit", limit);
        result.put("offset", offset);
        result.put("changes", changes);
        return result;
    }
    
    public List<Map<String, Object>> getChangesByDate() {
        return fileChangeRepository.findChangesByDate().stream()
            .map(result -> {
                Map<String, Object> item = new HashMap<>();
                item.put("date", result[0]);
                item.put("count", result[1]);
                return item;
            })
            .collect(Collectors.toList());
    }
    
    public Map<String, Object> getFileChangeStats() {
        long totalChanges = fileChangeRepository.count();
        List<FileChange> allChanges = fileChangeRepository.findAll();
        
        LocalDateTime firstChange = allChanges.stream()
            .map(FileChange::getTimestamp)
            .min(LocalDateTime::compareTo)
            .orElse(null);
        LocalDateTime lastChange = allChanges.stream()
            .map(FileChange::getTimestamp)
            .max(LocalDateTime::compareTo)
            .orElse(null);
        
        Map<String, Long> eventTypes = fileChangeRepository.findEventTypeCounts().stream()
            .collect(Collectors.toMap(
                result -> (String) result[0],
                result -> (Long) result[1]
            ));
        
        List<Map<String, Object>> topExtensions = fileChangeRepository.findTopExtensions(10).stream()
            .map(result -> {
                Map<String, Object> item = new HashMap<>();
                item.put("extension", result[0]);
                item.put("count", result[1]);
                return item;
            })
            .collect(Collectors.toList());
        
        List<Map<String, Object>> topDirectories = fileChangeRepository.findTopDirectories(10).stream()
            .map(result -> {
                Map<String, Object> item = new HashMap<>();
                item.put("directory", result[0]);
                item.put("count", result[1]);
                return item;
            })
            .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("total_changes", totalChanges);
        Map<String, Object> dateRange = new HashMap<>();
        dateRange.put("first_change", firstChange != null ? firstChange.toString() : null);
        dateRange.put("last_change", lastChange != null ? lastChange.toString() : null);
        result.put("date_range", dateRange);
        result.put("event_types", eventTypes);
        result.put("top_extensions", topExtensions);
        result.put("top_directories", topDirectories);
        return result;
    }
    
    public List<FileChange> getChangesForDate(String date) {
        LocalDate dateObj = LocalDate.parse(date);
        LocalDateTime start = dateObj.atStartOfDay();
        LocalDateTime end = dateObj.atTime(23, 59, 59).plusDays(1);
        return fileChangeRepository.findByDateRange(start, end);
    }
    
    @Transactional
    public void deleteFileChange(Integer changeId) {
        fileChangeRepository.deleteById(changeId);
    }
}

