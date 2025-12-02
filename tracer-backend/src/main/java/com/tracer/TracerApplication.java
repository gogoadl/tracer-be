package com.tracer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.tracer.entity")
@EnableJpaRepositories("com.tracer.repository")
public class TracerApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(TracerApplication.class, args);
    }
}

