package com.example.timetable.controller;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.timetable.model.User;
import com.example.timetable.repository.UserRepository;
import com.example.timetable.service.EmailService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Set<String> ALLOWED_SCHEDULER_EMAILS = Set.of(
            "nagaratna.p@nmit.ac.in",
            "uma.r@nmit.ac.in",
            "1nt22cs098.lalan@nmit.ac.in",
            "1nt22cs092.kotalo@nmit.ac.in");

    private boolean isBlockedInstitutionEmail(String email) {
        if (email == null) {
            return false;
        }
        String normalized = email.trim().toLowerCase();
        return normalized.endsWith("@nmit.ac.in") && !ALLOWED_SCHEDULER_EMAILS.contains(normalized);
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (isBlockedInstitutionEmail(user.getEmail())) {
            return ResponseEntity.status(400).body(Map.of(
                    "error",
                    "Only authorized @nmit.ac.in emails are permitted. Please use a personal email."));
        }

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(400).body(Map.of("error", "Email already registered"));
        }
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(400).body(Map.of("error", "Username already taken"));
        }

        // Hash the password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(400)
                    .body(Map.of("error", "No account found with this email address."));
        }

        User user = userOpt.get();
        // Generate 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setResetToken(otp);
        user.setTokenExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        try {
            emailService.sendPasswordResetEmail(email, otp);
        } catch (RuntimeException e) {
            // Roll back the OTP so the user can try again
            user.setResetToken(null);
            user.setTokenExpiry(null);
            userRepository.save(user);
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }

        return ResponseEntity.ok(Map.of("message", "OTP sent successfully."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String token = request.get("token");
        if (token != null) {
            token = token.replaceAll("\\s+", ""); // Strip any spaces from OTP
        }
        String newPassword = request.get("newPassword");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (user.getResetToken() != null && user.getResetToken().equals(token)) {
                if (user.getTokenExpiry().isAfter(LocalDateTime.now())) {
                    // Hash new password
                    user.setPassword(passwordEncoder.encode(newPassword));
                    user.setResetToken(null);
                    user.setTokenExpiry(null);
                    userRepository.save(user);

                    return ResponseEntity.ok(Map.of("message", "Password reset successful."));
                } else {

                    return ResponseEntity.status(400)
                            .body(Map.of("error", "The code has expired. Please request a new one."));
                }
            } else {

                return ResponseEntity.status(400).body(Map.of("error", "Invalid verification code."));
            }
        } else {

            return ResponseEntity.status(400).body(Map.of("error", "No user found with this email."));
        }
    }

    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(@RequestBody User updatedUser) {

        if (updatedUser.getId() == null) {

            return ResponseEntity.status(400).body(Map.of("error", "User ID is missing"));
        }

        Optional<User> userOpt = userRepository.findById(updatedUser.getId());
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Update allowed fields
            user.setName(updatedUser.getName());
            user.setDesignation(updatedUser.getDesignation());
            user.setDepartment(updatedUser.getDepartment());
            user.setPhoneNumber(updatedUser.getPhoneNumber());
            user.setUsername(updatedUser.getUsername());
            user.setProfilePicture(updatedUser.getProfilePicture());
            if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
                if (isBlockedInstitutionEmail(updatedUser.getEmail())) {
                    return ResponseEntity.status(400).body(Map.of(
                            "error",
                            "Only authorized @nmit.ac.in emails are permitted. Please use a personal email."));
                }
                user.setEmail(updatedUser.getEmail());
            }
            user.setBio(updatedUser.getBio());
            user.setCoverPhoto(updatedUser.getCoverPhoto());

            userRepository.save(user);

            return ResponseEntity.ok(user);
        } else {

            return ResponseEntity.status(404).body(Map.of("error", "User not found in database"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        Optional<User> userOpt = userRepository.findByUsernameOrEmail(username, username);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            if (isBlockedInstitutionEmail(userOpt.get().getEmail())) {
                return ResponseEntity.status(403).body(Map.of(
                        "error",
                        "This institutional email is not authorized. Please use an approved institutional email or a personal email."));
            }
            return ResponseEntity.ok(userOpt.get());
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
    }
}
