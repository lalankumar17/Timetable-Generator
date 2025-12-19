package com.example.timetable.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalTime;

@Document(collection = "exams")
public class Exam {

    @Id
    private String id;

    private Integer semester;
    private String courseName;
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String hallId;
    private String facultyName;
    private String department;
    private Integer durationMinutes;
    private String testCoordinator;
    private String hod;
    private String examType;
    private ExamStatus status = ExamStatus.DRAFT;

    public enum ExamStatus {
        DRAFT,
        PUBLISHED,
        DELETED
    }

    // Constructors
    public Exam() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public void setExamDate(LocalDate examDate) {
        this.examDate = examDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getHallId() {
        return hallId;
    }

    public void setHallId(String hallId) {
        this.hallId = hallId;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public ExamStatus getStatus() {
        return status;
    }

    public void setStatus(ExamStatus status) {
        this.status = status;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getTestCoordinator() {
        return testCoordinator;
    }

    public void setTestCoordinator(String testCoordinator) {
        this.testCoordinator = testCoordinator;
    }

    public String getHod() {
        return hod;
    }

    public void setHod(String hod) {
        this.hod = hod;
    }

    public String getExamType() {
        return examType;
    }

    public void setExamType(String examType) {
        this.examType = examType;
    }

    // Check if this exam conflicts with another (time overlap on same date)
    public boolean conflictsWith(Exam other) {
        if (other == null || this.examDate == null || other.examDate == null
                || this.startTime == null || this.endTime == null
                || other.startTime == null || other.endTime == null) {
            return false;
        }
        if (!this.examDate.equals(other.examDate))
            return false;
        return this.startTime.isBefore(other.endTime) && other.startTime.isBefore(this.endTime);
    }
}
