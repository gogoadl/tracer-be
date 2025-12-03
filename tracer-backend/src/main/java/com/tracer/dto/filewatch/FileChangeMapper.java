package com.tracer.dto.filewatch;

import com.tracer.entity.FileChange;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FileChangeMapper {
    
    public FileChangeDto toDto(FileChange change) {
        if (change == null) {
            return null;
        }
        return new FileChangeDto(
            change.getId(),
            change.getTimestamp(),
            change.getDate(),
            change.getEventType(),
            change.getFilePath(),
            change.getDirectory(),
            change.getFileName(),
            change.getFileExtension(),
            change.getSize(),
            change.getIsDirectory(),
            change.getSrcPath()
        );
    }
    
    public List<FileChangeDto> toDtoList(List<FileChange> changes) {
        return changes.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }
}

