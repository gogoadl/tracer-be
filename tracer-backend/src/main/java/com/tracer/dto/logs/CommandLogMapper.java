package com.tracer.dto.logs;

import com.tracer.entity.CommandLog;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CommandLogMapper {
    
    public CommandLogDto toDto(CommandLog log) {
        if (log == null) {
            return null;
        }
        return new CommandLogDto(
            log.getId(),
            log.getTimestamp(),
            log.getDate(),
            log.getTime(),
            log.getUser(),
            log.getDirectory(),
            log.getCommand()
        );
    }
    
    public List<CommandLogDto> toDtoList(List<CommandLog> logs) {
        return logs.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }
}

