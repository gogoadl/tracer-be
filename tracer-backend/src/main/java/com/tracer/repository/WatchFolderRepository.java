package com.tracer.repository;

import com.tracer.entity.WatchFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WatchFolderRepository extends JpaRepository<WatchFolder, Integer> {
    
    List<WatchFolder> findByIsActive(String isActive);
    
    WatchFolder findByPath(String path);
}

