package com.tracer.controller;

import com.tracer.entity.FileChange;
import com.tracer.entity.WatchFolder;
import com.tracer.service.FileWatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FileWatchController {
    
    private final FileWatchService fileWatchService;
    
    @PostMapping("/folders/add")
    public ResponseEntity<Map<String, Object>> addWatchFolder(
            @RequestParam String path,
            @RequestParam(required = false) String file_patterns,
            @RequestParam(defaultValue = "true") boolean recursive) {
        
        WatchFolder folder = fileWatchService.addWatchFolder(path, file_patterns, recursive);
        
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Folder added to watch list");
        Map<String, Object> folderData = new HashMap<>();
        folderData.put("id", folder.getId());
        folderData.put("path", folder.getPath());
        folderData.put("is_active", folder.getIsActive());
        result.put("folder", folderData);
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/folders")
    public ResponseEntity<Map<String, Object>> getWatchFolders() {
        List<WatchFolder> folders = fileWatchService.getAllWatchFolders();
        
        Map<String, Object> result = new HashMap<>();
        result.put("total", folders.size());
        result.put("folders", folders.stream().map(f -> {
            Map<String, Object> folderData = new HashMap<>();
            folderData.put("id", f.getId());
            folderData.put("path", f.getPath());
            folderData.put("is_active", f.getIsActive());
            folderData.put("file_patterns", f.getFilePatterns());
            folderData.put("recursive", f.getRecursive());
            folderData.put("created_at", f.getCreatedAt() != null ? f.getCreatedAt().toString() : null);
            return folderData;
        }).toList());
        
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/folders/{folderId}")
    public ResponseEntity<Map<String, String>> removeWatchFolder(@PathVariable Integer folderId) {
        fileWatchService.removeWatchFolder(folderId);
        Map<String, String> result = new HashMap<>();
        result.put("message", "Folder removed from watch list");
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/folders/{folderId}/toggle")
    public ResponseEntity<Map<String, Object>> toggleWatchFolder(@PathVariable Integer folderId) {
        WatchFolder folder = fileWatchService.toggleWatchFolder(folderId);
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Folder status updated");
        result.put("is_active", folder.getIsActive());
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/changes")
    public ResponseEntity<Map<String, Object>> getFileChanges(
            @RequestParam(required = false) String start_date,
            @RequestParam(required = false) String end_date,
            @RequestParam(required = false) String event_type,
            @RequestParam(required = false) String file_extension,
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        
        return ResponseEntity.ok(fileWatchService.getFileChanges(
            start_date, end_date, event_type, file_extension, limit, offset));
    }
    
    @GetMapping("/changes/by-date")
    public ResponseEntity<Map<String, Object>> getChangesByDate() {
        List<Map<String, Object>> changesByDate = fileWatchService.getChangesByDate();
        Map<String, Object> result = new HashMap<>();
        result.put("changes_by_date", changesByDate);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/changes/stats")
    public ResponseEntity<Map<String, Object>> getFileChangeStats() {
        return ResponseEntity.ok(fileWatchService.getFileChangeStats());
    }
    
    @GetMapping("/changes/date/{date}")
    public ResponseEntity<Map<String, Object>> getChangesForDate(@PathVariable String date) {
        List<FileChange> changes = fileWatchService.getChangesForDate(date);
        Map<String, Object> result = new HashMap<>();
        result.put("date", date);
        result.put("count", changes.size());
        result.put("changes", changes);
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/changes/{changeId}")
    public ResponseEntity<Map<String, Object>> deleteFileChange(@PathVariable Integer changeId) {
        fileWatchService.deleteFileChange(changeId);
        Map<String, Object> result = new HashMap<>();
        result.put("message", "File change deleted successfully");
        result.put("id", changeId);
        return ResponseEntity.ok(result);
    }
}

