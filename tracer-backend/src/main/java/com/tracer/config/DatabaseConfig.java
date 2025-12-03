package com.tracer.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

/**
 * Database configuration class.
 * 
 * Supports both SQLite (default/production) and H2 (local profile).
 * Environment variables:
 *   - SPRING_DATASOURCE_URL (preferred)
 *   - DATABASE_URL (fallback)
 */
@Configuration
public class DatabaseConfig {
    
    @Bean
    @Primary
    @Profile("!local")
    public DataSource dataSource(
            @Value("${SPRING_DATASOURCE_URL:jdbc:sqlite:./data/logs.db}") String springDatasourceUrl,
            @Value("${DATABASE_URL:}") String databaseUrl) {
        
        String url = springDatasourceUrl;
        if (url == null || url.isEmpty() || url.equals("jdbc:sqlite:./data/logs.db")) {
            if (databaseUrl != null && !databaseUrl.isEmpty()) {
                url = databaseUrl;
                // Convert DATABASE_URL format to JDBC format if needed
                if (!url.startsWith("jdbc:")) {
                    if (url.startsWith("sqlite://")) {
                        url = url.replace("sqlite://", "jdbc:sqlite:");
                    } else {
                        url = "jdbc:sqlite:" + url;
                    }
                }
            }
        }
        
        return DataSourceBuilder.create()
                .url(url)
                .driverClassName("org.sqlite.JDBC")
                .build();
    }
}

