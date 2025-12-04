package com.tracer.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI (Swagger) configuration.
 */
@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI tracerOpenAPI() {
        Server localServer = new Server();
        localServer.setUrl("http://localhost:8080");
        localServer.setDescription("Local Development Server");
        
        Server dockerServer = new Server();
        dockerServer.setUrl("http://localhost:8091");
        dockerServer.setDescription("Docker Production Server");
        
        Contact contact = new Contact();
        contact.setName("Tracer Team");
        contact.setEmail("support@tracer.com");
        
        License license = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");
        
        Info info = new Info()
                .title("Tracer API")
                .version("1.0.0")
                .description("""
                        Tracer API Documentation
                        
                        Tracer는 리눅스 시스템의 셸 명령어 로그와 파일 변경사항을 추적하고 분석하는 통합 모니터링 시스템입니다.
                        
                        ## 주요 기능
                        - 📝 명령어 로깅: 리눅스 시스템에서 실행된 모든 셸 명령어를 자동으로 로깅
                        - 📁 파일 변경 감시: 지정된 디렉토리의 파일 변경사항 실시간 감지
                        - 📊 데이터 시각화: 명령어 및 파일 변경 통계를 한눈에 확인
                        """)
                .contact(contact)
                .license(license);
        
        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer, dockerServer));
    }
}

