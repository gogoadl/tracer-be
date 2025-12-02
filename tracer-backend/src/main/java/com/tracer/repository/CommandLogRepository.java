package com.tracer.repository;

import com.tracer.entity.CommandLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommandLogRepository extends JpaRepository<CommandLog, Integer> {
    
    List<CommandLog> findByTimestampBetweenOrderByTimestampDesc(
        LocalDateTime start, LocalDateTime end);
    
    List<CommandLog> findByUser(String user);
    
    List<CommandLog> findByDirectoryContaining(String directory);
    
    List<CommandLog> findByCommandContaining(String search);
    
    @Query("SELECT c.date, COUNT(c.id) FROM CommandLog c GROUP BY c.date ORDER BY c.date DESC")
    List<Object[]> findLogsByDate();
    
    @Query("SELECT COUNT(DISTINCT c.user) FROM CommandLog c")
    Long countDistinctUsers();
    
    @Query("SELECT c.user, COUNT(c.id) FROM CommandLog c GROUP BY c.user ORDER BY COUNT(c.id) DESC")
    List<Object[]> findMostActiveUser();
    
    @Query(value = "SELECT command, COUNT(id) FROM command_logs GROUP BY command ORDER BY COUNT(id) DESC LIMIT ?1", nativeQuery = true)
    List<Object[]> findTopCommands(int limit);
    
    @Query("SELECT DISTINCT c.user FROM CommandLog c ORDER BY c.user")
    List<String> findDistinctUsers();
    
    @Query("SELECT DISTINCT c.directory FROM CommandLog c ORDER BY c.directory")
    List<String> findDistinctDirectories();
    
    @Query("SELECT c FROM CommandLog c WHERE c.timestamp >= :start AND c.timestamp < :end ORDER BY c.timestamp DESC")
    List<CommandLog> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}

