package com.tracer.dto.filewatch;

import com.tracer.entity.WatchFolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class WatchFolderMapper {
    
    public WatchFolderDto toDto(WatchFolder folder) {
        if (folder == null) {
            return null;
        }
        return new WatchFolderDto(
            folder.getId(),
            folder.getPath(),
            folder.getIsActive(),
            folder.getFilePatterns(),
            folder.getRecursive(),
            folder.getCreatedAt(),
            folder.getLastChecked()
        );
    }
    
    public List<WatchFolderDto> toDtoList(List<WatchFolder> folders) {
        return folders.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }
}

