package com.schoolmanagement.service;

import com.schoolmanagement.entity.Subject;
import com.schoolmanagement.repository.SubjectRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {
    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public List<Subject> getAll() {
        return subjectRepository.findAll();
    }

    public Subject getById(Long id) {
        return subjectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
    }

    public Subject create(Subject subject) {
        return subjectRepository.save(subject);
    }

    public Subject update(Long id, Subject updated) {
        Subject existing = getById(id);
        existing.setName(updated.getName());
        existing.setLessonsPerWeek(updated.getLessonsPerWeek());
        return subjectRepository.save(existing);
    }

    public void delete(Long id) {
        subjectRepository.deleteById(id);
    }
}
