package com.tracer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "command_logs", indexes = {
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_date", columnList = "date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommandLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false)
    private String date;
    
    @Column(nullable = false)
    private String time;
    
    @Column(nullable = false)
    private String user;
    
    @Column(nullable = false)
    private String directory;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String command;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String rawLine;
}

