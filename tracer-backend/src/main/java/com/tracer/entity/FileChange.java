package com.tracer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "file_changes", indexes = {
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_date", columnList = "date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileChange {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false)
    private String date;
    
    @Column(nullable = false)
    private String eventType; // created, deleted, modified, moved
    
    @Column(nullable = false)
    private String filePath;
    
    @Column(nullable = false)
    private String directory;
    
    @Column(nullable = false)
    private String fileName;
    
    private String fileExtension;
    
    private Integer size; // File size in bytes
    
    @Column(name = "is_directory")
    private String isDirectory; // "True" or "False" as string
    
    private String srcPath; // For moved events
    
    @Column(columnDefinition = "TEXT")
    private String rawData; // Store file content as JSON
}

