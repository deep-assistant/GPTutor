package com.chatgpt;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
class ChatGptApplicationTests {

    @Test
    void contextLoads() {
        // Test that Spring context loads successfully
    }
}