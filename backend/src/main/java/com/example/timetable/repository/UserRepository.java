package com.example.timetable.repository;

import com.example.timetable.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByResetToken(String resetToken);

    Optional<User> findByUsernameOrEmail(String username, String email);
}
