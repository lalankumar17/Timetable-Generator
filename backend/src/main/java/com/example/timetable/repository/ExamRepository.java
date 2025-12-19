package com.example.timetable.repository;

import com.example.timetable.model.Exam;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends MongoRepository<Exam, String> {

        List<Exam> findByStatus(Exam.ExamStatus status);
}
