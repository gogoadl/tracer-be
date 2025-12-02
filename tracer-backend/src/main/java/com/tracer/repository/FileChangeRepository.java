package com.tracer.repository;

import com.tracer.entity.FileChange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FileChangeRepository extends JpaRepository<FileChange, Integer> {
    
    List<FileChange> findByTimestampBetweenOrderByTimestampDesc(
        LocalDateTime start, LocalDateTime end);
    
    List<FileChange> findByEventType(String eventType);
    
    List<FileChange> findByFileExtension(String fileExtension);
    
    @Query("SELECT f.date, COUNT(f.id) FROM FileChange f GROUP BY f.date ORDER BY f.date DESC")
    List<Object[]> findChangesByDate();
    
    @Query("SELECT f.eventType, COUNT(f.id) FROM FileChange f GROUP BY f.eventType")
    List<Object[]> findEventTypeCounts();
    
    @Query(value = "SELECT file_extension, COUNT(id) FROM file_changes WHERE file_extension IS NOT NULL GROUP BY file_extension ORDER BY COUNT(id) DESC LIMIT ?1", nativeQuery = true)
    List<Object[]> findTopExtensions(int limit);
    
    @Query(value = "SELECT directory, COUNT(id) FROM file_changes GROUP BY directory ORDER BY COUNT(id) DESC LIMIT ?1", nativeQuery = true)
    List<Object[]> findTopDirectories(int limit);
    
    @Query("SELECT f FROM FileChange f WHERE f.timestamp >= :start AND f.timestamp < :end ORDER BY f.timestamp ASC")
    List<FileChange> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    List<FileChange> findByFilePathOrderByTimestampDesc(String filePath);
}

