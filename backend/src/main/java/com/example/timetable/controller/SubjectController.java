package com.example.timetable.controller;

import com.example.timetable.model.Subject;
import com.example.timetable.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/io/subjects")
@CrossOrigin(origins = "*")
public class SubjectController {

    @Autowired
    private SubjectRepository subjectRepository;

    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @GetMapping("/codes")
    public List<String> getSubjectCodes() {
        return subjectRepository.findAll().stream()
                .map(Subject::getName)
                .collect(Collectors.toList());
    }

    @GetMapping("/{name}")
    public Subject getSubject(@PathVariable String name) {
        return subjectRepository.findById(name).orElse(null);
    }

    @PutMapping("/{name}")
    public ResponseEntity<?> saveSubject(@PathVariable String name, @RequestBody Subject subject) {

        try {
            subject.setName(name);
            Subject saved = subjectRepository.save(subject);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {

            return ResponseEntity.status(500).body("Backend Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{name}")
    public void deleteSubject(@PathVariable String name) {
        subjectRepository.deleteById(name);
    }

    // Update all subjects without department to have a specific department
    @PostMapping("/update-department/{department}")
    public String updateSubjectsWithDepartment(@PathVariable String department) {
        List<Subject> subjects = subjectRepository.findAll();
        int updated = 0;
        for (Subject subject : subjects) {
            if (subject.getDepartment() == null || subject.getDepartment().isEmpty()) {
                subject.setDepartment(department);
                subjectRepository.save(subject);
                updated++;
            }
        }
        return "Updated " + updated + " subjects with department: " + department;
    }

    // Get subjects filtered by department and semester
    @GetMapping("/filter")
    public List<Subject> getSubjectsByFilter(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer semester) {
        return subjectRepository.findAll().stream()
                .filter(s -> (department == null || department.equals(s.getDepartment())))
                .filter(s -> (semester == null || semester.equals(s.getSemester())))
                .collect(Collectors.toList());
    }
}
