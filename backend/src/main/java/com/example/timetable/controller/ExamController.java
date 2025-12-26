package com.example.timetable.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.timetable.model.Exam;
import com.example.timetable.model.Exam.ExamStatus;
import com.example.timetable.service.ExamService;
import com.example.timetable.service.ExamService.ConflictResult;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {

    private static final Set<String> ALLOWED_SCHEDULER_EMAILS = Set.of(
            "nagaratna.p@nmit.ac.in",
            "uma.r@nmit.ac.in",
            "1nt22cs098.lalan@nmit.ac.in",
            "1nt22cs092.kotalo@nmit.ac.in");

    private boolean isAllowedScheduler(String actorEmail) {
        if (actorEmail == null) {
            return false;
        }
        return ALLOWED_SCHEDULER_EMAILS.contains(actorEmail.trim().toLowerCase());
    }

    @Autowired
    private ExamService examService;

    // Get all exams with optional filters
    @GetMapping
    public List<Exam> getAllExams(
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) ExamStatus status) {
        return examService.getExams(semester, department, status);
    }

    // Schedule a new exam
    @PostMapping
    public ResponseEntity<?> scheduleExam(
            @RequestParam(required = false) String actorEmail,
            @RequestBody ExamRequest request) {

        if (!isAllowedScheduler(actorEmail)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only approved scheduler accounts can modify timetable."));
        }

        try {
            Exam exam = new Exam();
            exam.setSemester(request.semester);
            exam.setCourseName(request.courseName);
            exam.setExamDate(LocalDate.parse(request.examDate));
            exam.setStartTime(LocalTime.parse(request.startTime));
            exam.setEndTime(LocalTime.parse(request.endTime));
            exam.setHallId(request.hallId);
            exam.setFacultyName(request.facultyName);
            exam.setDepartment(request.department);
            if (request.durationMinutes != null) {
                exam.setDurationMinutes(request.durationMinutes);
            } else {
                exam.setDurationMinutes(120);
            }
            exam.setTestCoordinator(request.testCoordinator);
            exam.setHod(request.hod);
            exam.setExamType(request.examType);

            Exam saved = examService.scheduleExam(exam);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {

            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update exam (manual adjustment)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateExam(
            @PathVariable String id,
            @RequestParam(required = false) String actorEmail,
            @RequestBody ExamRequest request) {
        if (!isAllowedScheduler(actorEmail)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only approved scheduler accounts can modify timetable."));
        }

        try {
            Exam updates = new Exam();
            if (request.semester != null)
                updates.setSemester(request.semester);
            if (request.courseName != null)
                updates.setCourseName(request.courseName);
            if (request.department != null)
                updates.setDepartment(request.department);
            if (request.examDate != null)
                updates.setExamDate(LocalDate.parse(request.examDate));
            if (request.startTime != null)
                updates.setStartTime(LocalTime.parse(request.startTime));
            if (request.endTime != null)
                updates.setEndTime(LocalTime.parse(request.endTime));
            if (request.durationMinutes != null)
                updates.setDurationMinutes(request.durationMinutes);
            updates.setHallId(request.hallId);
            updates.setFacultyName(request.facultyName);
            updates.setTestCoordinator(request.testCoordinator);
            updates.setHod(request.hod);
            updates.setExamType(request.examType);

            Exam updated = examService.updateExam(id, updates);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Delete exam
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExam(
            @PathVariable String id,
            @RequestParam(required = false) String actorEmail) {
        if (!isAllowedScheduler(actorEmail)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only approved scheduler accounts can modify timetable."));
        }

        try {
            examService.deleteExam(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Detect conflicts
    @GetMapping("/conflicts")
    public ResponseEntity<ConflictResult> detectConflicts(
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(examService.detectConflicts(semester, department));
    }

    // Auto-resolve conflicts
    @PostMapping("/auto-resolve")
    public ResponseEntity<?> autoResolve(
            @RequestParam(required = false) String actorEmail,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String department) {
        if (!isAllowedScheduler(actorEmail)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only approved scheduler accounts can modify timetable."));
        }

        try {
            int resolved = examService.autoResolveConflicts(semester, department);
            return ResponseEntity.ok(Map.of(
                    "resolved", resolved,
                    "message", resolved > 0 ? "Resolved " + resolved + " conflicts" : "No conflicts to resolve"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Publish timetable
    @PutMapping("/publish")
    public ResponseEntity<?> publish(
            @RequestParam(required = false) String actorEmail,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String department) {
        if (!isAllowedScheduler(actorEmail)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only approved scheduler accounts can modify timetable."));
        }

        try {
            int published = examService.publishTimetable(semester, department);
            return ResponseEntity.ok(Map.of(
                    "published", published,
                    "message", "Published " + published + " exam(s)"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get status
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        Map<String, Object> stats = new HashMap<>(examService.getStatus());
        return ResponseEntity.ok(stats);
    }

    // Get departments list
    @GetMapping("/departments")
    public List<String> getDepartments() {
        return examService.getDepartments();
    }

    // DTO for requests
    public static class ExamRequest {
        public Integer semester;
        public String courseName;
        public String examDate;
        public String startTime;
        public String endTime;
        public String hallId;
        public String facultyName;
        public String department;
        public Integer durationMinutes;
        public String testCoordinator;
        public String hod;
        public String examType;
    }
}
