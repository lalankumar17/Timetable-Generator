package com.example.timetable.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import com.example.timetable.model.Exam;
import com.example.timetable.model.Exam.ExamStatus;
import com.example.timetable.repository.ExamRepository;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    // Get all exams with optional filters
    public List<Exam> getExams(Integer semester, String department, ExamStatus status) {
        org.springframework.data.mongodb.core.query.Query query = new org.springframework.data.mongodb.core.query.Query();

        if (semester != null) {
            query.addCriteria(org.springframework.data.mongodb.core.query.Criteria.where("semester").is(semester));
        }
        if (department != null && !department.isEmpty()) {
            query.addCriteria(org.springframework.data.mongodb.core.query.Criteria.where("department").is(department));
        }
        if (status != null) {
            query.addCriteria(org.springframework.data.mongodb.core.query.Criteria.where("status").is(status));
        }

        // Sort by examDate, startTime, semester
        query.with(org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Order.asc("examDate"),
                org.springframework.data.domain.Sort.Order.asc("startTime"),
                org.springframework.data.domain.Sort.Order.asc("semester")));

        return mongoTemplate.find(query, Exam.class);
    }

    // Schedule a new exam
    public Exam scheduleExam(Exam exam) {
        // Enforce Max 2 Exams per day logic (Per Exam Type, Scope Department)
        List<Exam> existing = getExams(exam.getSemester(), exam.getDepartment(), null);
        long count = existing.stream()
                .filter(e -> e.getExamDate().equals(exam.getExamDate())
                        && e.getExamType().equalsIgnoreCase(exam.getExamType())
                        // Ensure we count only exams in THIS department and semester
                        && e.getSemester().equals(exam.getSemester())
                        && e.getDepartment().equals(exam.getDepartment())
                        && e.getStatus() != ExamStatus.DELETED)
                .count();

        if (count >= 2) {
            throw new RuntimeException("Cannot schedule: Date " + exam.getExamDate() + " already has 2 exams of type "
                    + exam.getExamType());
        }

        exam.setStatus(ExamStatus.DRAFT);
        return examRepository.save(exam);
    }

    // Update an existing exam (manual adjustment)
    public Exam updateExam(String id, Exam updates) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        if (updates.getSemester() != null)
            exam.setSemester(updates.getSemester());
        if (updates.getDepartment() != null)
            exam.setDepartment(updates.getDepartment());
        if (updates.getCourseName() != null)
            exam.setCourseName(updates.getCourseName());
        if (updates.getExamDate() != null)
            exam.setExamDate(updates.getExamDate());
        if (updates.getStartTime() != null)
            exam.setStartTime(updates.getStartTime());
        if (updates.getEndTime() != null)
            exam.setEndTime(updates.getEndTime());
        if (updates.getHallId() != null)
            exam.setHallId(updates.getHallId());
        if (updates.getFacultyName() != null)
            exam.setFacultyName(updates.getFacultyName());
        if (updates.getDurationMinutes() != null)
            exam.setDurationMinutes(updates.getDurationMinutes());
        if (updates.getExamType() != null)
            exam.setExamType(updates.getExamType());

        return examRepository.save(exam);
    }

    // Delete a draft exam
    public void deleteExam(String id) {
        examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        examRepository.deleteById(id);
    }

    // Detect all conflicts
    public ConflictResult detectConflicts(Integer semester, String department) {
        List<Exam> exams = getExams(semester, department, null); // Check ALL exams, not just DRAFT
        List<Conflict> conflicts = new ArrayList<>();
        Set<String> reportedLoadKeys = new HashSet<>();
        Set<String> timeConflictedExams = new HashSet<>();

        for (int i = 0; i < exams.size(); i++) {
            for (int j = i + 1; j < exams.size(); j++) {
                Exam e1 = exams.get(i);
                Exam e2 = exams.get(j);

                if (e1.conflictsWith(e2)) {
                    // Student conflict, including accidental duplicate entries for the same course.
                    if (sameStudentExamGroup(e1, e2)) {
                        String msg = buildTimeConflictMessage(e1, e2);
                        if (!timeConflictedExams.contains(msg)) {
                            timeConflictedExams.add(msg);
                            conflicts.add(new Conflict(
                                    "STUDENT",
                                    msg,
                                    e1.getId(), e2.getId()));
                        }
                    }
                }

                // Conflicts that don't require time overlap - just same date

                // 2. Daily Load Limit (Max 2 exams per day per Dept/Sem AND Exam Type each)
                if (e1.getSemester().equals(e2.getSemester())
                        && e1.getDepartment().equals(e2.getDepartment())
                        && e1.getExamDate().equals(e2.getExamDate())
                        && e1.getExamType().equalsIgnoreCase(e2.getExamType())) {

                    String loadKey = e1.getExamDate() + "-" + e1.getSemester() + "-" + e1.getDepartment() + "-"
                            + e1.getExamType().toLowerCase();
                    long dailyLoad = exams.stream().filter(e -> e.getExamDate().equals(e1.getExamDate())
                            && e.getSemester().equals(e1.getSemester())
                            && e.getDepartment().equals(e1.getDepartment())
                            && e.getExamType().equalsIgnoreCase(e1.getExamType())
                            && e.getStatus() != ExamStatus.DELETED).count();

                    if (dailyLoad > 2 && !reportedLoadKeys.contains(loadKey)) {
                        reportedLoadKeys.add(loadKey);
                        conflicts.add(new Conflict(
                                "MAX_LOAD",
                                String.format("Sem %d %s  :  %d exams on %s (limit: 2)",
                                        e1.getSemester(), e1.getDepartment(), dailyLoad,
                                        e1.getExamDate().format(DateTimeFormatter.ofPattern("dd MMM"))),
                                e1.getId(), e2.getId()));
                    }
                }

                // 3. Daily Limit for Retest MSE I (One per day)
                if (e1.getSemester().equals(e2.getSemester()) && e1.getDepartment().equals(e2.getDepartment())) {
                    String type1 = e1.getExamType() != null ? e1.getExamType().trim() : "";
                    String type2 = e2.getExamType() != null ? e2.getExamType().trim() : "";

                    if (e1.getExamDate().equals(e2.getExamDate())) {
                        if ((type1.equalsIgnoreCase("Retest MSE I") && type2.equalsIgnoreCase("Retest MSE I"))
                                || (type1.equalsIgnoreCase("Retest MSE II") && type2.equalsIgnoreCase("Retest MSE II"))
                                        && !e1.getCourseName().equalsIgnoreCase(e2.getCourseName())) {
                            conflicts.add(new Conflict(
                                    "DAILY_LIMIT",
                                    String.format("Only one %s allowed per date. Conflicts: %s and %s",
                                            type1, e1.getCourseName(), e2.getCourseName()),
                                    e1.getId(), e2.getId()));
                        }
                    }
                }
            }
        }

        return new ConflictResult(conflicts.isEmpty(), conflicts);
    }

    private boolean sameStudentExamGroup(Exam first, Exam second) {
        return Objects.equals(first.getSemester(), second.getSemester())
                && sameText(first.getExamType(), second.getExamType());
    }

    private boolean sameText(String first, String second) {
        return first != null && second != null && first.trim().equalsIgnoreCase(second.trim());
    }

    private String buildTimeConflictMessage(Exam first, Exam second) {
        String firstCourse = displayText(first.getCourseName(), "Unnamed subject");
        String secondCourse = displayText(second.getCourseName(), "Unnamed subject");

        if (sameText(first.getCourseName(), second.getCourseName())) {
            return String.format("\"%s\" is already scheduled at this time. Please choose a different slot.",
                    firstCourse);
        }

        return String.format("\"%s\" and \"%s\" are both scheduled at the same time. Please move one subject to another slot.",
                firstCourse, secondCourse);
    }

    private String displayText(String value, String fallback) {
        return value != null && !value.trim().isEmpty() ? value.trim() : fallback;
    }

    // Auto-resolve conflicts by rescheduling (Prioritize TIME change, then DATE,
    // respecting Max Load per Type)
    public int autoResolveConflicts(Integer semester, String department) {

        List<Exam> allExams = getExams(semester, department, null).stream()
                .filter(e -> e.getStatus() != ExamStatus.DELETED)
                .collect(Collectors.toList());
        int resolvedCount = 0;

        List<Exam> examsToReschedule = new ArrayList<>();
        List<Exam> stableExams = new ArrayList<>();

        // Sort: PUBLISHED first, then by date/time
        allExams.sort(Comparator.comparing((Exam e) -> e.getStatus() == ExamStatus.PUBLISHED ? 0 : 1)
                .thenComparing(Exam::getExamDate)
                .thenComparing(Exam::getStartTime));

        for (Exam candidate : allExams) {
            boolean hasConflict = false;

            // Check Daily Load Limit First (against stable exams of SAME TYPE)
            long dailyCount = stableExams.stream().filter(e -> e.getExamDate().equals(candidate.getExamDate())
                    && e.getSemester().equals(candidate.getSemester())
                    && e.getDepartment().equals(candidate.getDepartment())
                    && e.getExamType().equalsIgnoreCase(candidate.getExamType())).count();

            if (dailyCount >= 2) {
                hasConflict = true;

            }

            for (Exam stable : stableExams) {
                // Check for Time Conflict
                if (candidate.conflictsWith(stable) && candidate.getSemester().equals(stable.getSemester())) {
                    hasConflict = true;
                }
                if (hasConflict)
                    break;
            }

            if (hasConflict && candidate.getStatus() == ExamStatus.DRAFT) {
                examsToReschedule.add(candidate);
            } else {
                stableExams.add(candidate);
            }
        }

        LocalTime[] standardSlots = { LocalTime.of(9, 30), LocalTime.of(13, 30) };
        int standardDuration = 90;

        for (Exam exam : examsToReschedule) {
            LocalDate date = exam.getExamDate();
            boolean scheduled = false;

            // Try to find a slot within the next 30 days (starting D=0 for SAME DAY)
            for (int d = 0; d < 30 && !scheduled; d++) {
                LocalDate targetDate = date.plusDays(d);

                // Check Daily Load for Target Date (SAME TYPE)
                long targetDailyCount = stableExams.stream().filter(e -> e.getExamDate().equals(targetDate)
                        && e.getSemester().equals(exam.getSemester())
                        && e.getDepartment().equals(exam.getDepartment())
                        && e.getExamType().equalsIgnoreCase(exam.getExamType())
                        && e.getStatus() != ExamStatus.DELETED).count();

                if (targetDailyCount >= 2) {
                    continue; // Skip this date, it's full (2 exams already)
                }

                for (LocalTime slotStart : standardSlots) {
                    LocalTime slotEnd = slotStart.plusMinutes(standardDuration);

                    boolean slotBusy = false;
                    for (Exam stable : stableExams) {
                        if (stable.getSemester().equals(exam.getSemester())) {
                            if (stable.getExamDate().equals(targetDate)) {
                                // 1. Time Overlap Check
                                if (stable.getStartTime().isBefore(slotEnd) && stable.getEndTime().isAfter(slotStart)) {
                                    slotBusy = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (!slotBusy) {
                        exam.setExamDate(targetDate);
                        exam.setStartTime(slotStart);
                        exam.setEndTime(slotEnd);
                        exam.setDurationMinutes(standardDuration);

                        examRepository.save(exam);
                        stableExams.add(exam);
                        resolvedCount++;
                        scheduled = true;

                        break;
                    }
                }
            }
        }

        return resolvedCount;
    }

    // Publish and lock timetable
    public int publishTimetable(Integer semester, String department) {
        ConflictResult conflicts = detectConflicts(semester, department);
        if (!conflicts.isConflictFree()) {
            throw new RuntimeException("Cannot publish: Unresolved conflicts exist");
        }

        List<Exam> exams = getExams(semester, department, null);
        int published = 0;

        for (Exam exam : exams) {
            if (exam.getStatus() == ExamStatus.DRAFT) {
                exam.setStatus(ExamStatus.PUBLISHED);
                examRepository.save(exam);
                published++;
            }
        }

        return published;
    }

    // Get status counts
    public Map<String, Object> getStatus() {
        long total = examRepository.count();
        long published = examRepository.findByStatus(ExamStatus.PUBLISHED).size();
        long draft = total - published;

        String dbStatus = "Connected";
        try {
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
        } catch (Exception e) {
            dbStatus = "Disconnected";
        }

        return Map.of(
                "total", total,
                "published", published,
                "draft", draft,
                "isFullyPublished", total > 0 && draft == 0,
                "db", dbStatus,
                "backend", "OK");
    }

    // Get distinct departments
    public List<String> getDepartments() {
        return examRepository.findAll().stream()
                .map(Exam::getDepartment)
                .filter(d -> d != null && !d.isEmpty())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public static class Conflict {
        private final String type;
        private final String message;
        private final String examId1;
        private final String examId2;

        public Conflict(String type, String message, String examId1, String examId2) {
            this.type = type;
            this.message = message;
            this.examId1 = examId1;
            this.examId2 = examId2;
        }

        public String getType() {
            return type;
        }

        public String getMessage() {
            return message;
        }

        public String getExamId1() {
            return examId1;
        }

        public String getExamId2() {
            return examId2;
        }
    }

    public static class ConflictResult {
        private final boolean conflictFree;
        private final List<Conflict> conflicts;

        public ConflictResult(boolean conflictFree, List<Conflict> conflicts) {
            this.conflictFree = conflictFree;
            this.conflicts = conflicts;
        }

        public boolean isConflictFree() {
            return conflictFree;
        }

        public List<Conflict> getConflicts() {
            return conflicts;
        }
    }
}
