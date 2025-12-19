package com.example.timetable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private com.example.timetable.repository.UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        try {
            long userCount = userRepository.count();
            logger.info("✓ Database connected. Registered users: {}", userCount);
        } catch (Exception e) {
            logger.error("⚠ MongoDB not connected. App will work without database persistence.");
            logger.error("  Start MongoDB and restart the app to enable data saving.");
        }
    }
}
