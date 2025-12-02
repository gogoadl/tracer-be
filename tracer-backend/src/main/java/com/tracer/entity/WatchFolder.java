package com.tracer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "watch_folders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WatchFolder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false, unique = true)
    private String path;
    
    @Column(name = "is_active")
    private String isActive; // "True" or "False"
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "last_checked")
    private LocalDateTime lastChecked;
    
    @Column(columnDefinition = "TEXT")
    private String filePatterns; // Comma-separated file patterns
    
    private String recursive; // "True" or "False"
}

