package com.schoolmanagement.service;

import com.schoolmanagement.entity.Parent;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.repository.ParentRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class ParentService {
    private final ParentRepository parentRepository;

    public ParentService(ParentRepository parentRepository) {
        this.parentRepository = parentRepository;
    }

    public List<Parent> getAll() {
        return parentRepository.findAll();
    }

    private String generateEmail(String fullName) {
        if (fullName == null)
            return null;

        String normalized = java.text.Normalizer.normalize(fullName, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replaceAll("đ", "d")
                .replaceAll("Đ", "d")
                .toLowerCase()
                .replaceAll("\\s+", "");

        return "ph" + normalized + "nt@gmail.com";
    }

    public Parent getByEmail(String email) {
        return parentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));
    }

    public Set<Student> getStudentsByParentEmail(String email) {
        Set<Student> students = parentRepository.findStudentsByEmail(email);

        for (Student s : students) {
            if (s.getStudentClass() != null) {
                s.setClassName(s.getStudentClass().getName());
                s.setClassId(s.getStudentClass().getId());
            }
        }

        return students;
    }

    public Parent getById(Long id) {
        return parentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Parent not found"));
    }

    public Parent create(Parent parent) {

        // 🔥 AUTO EMAIL
        if (parent.getEmail() == null || parent.getEmail().isEmpty()) {
            parent.setEmail(generateEmail(parent.getFullName()));
        }

        return parentRepository.save(parent);
    }

    public Parent updateByEmail(String email, Parent update) {

        Parent existing = parentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));

        existing.setFullName(update.getFullName());
        existing.setPhone(update.getPhone());
        existing.setJob(update.getJob());

        return parentRepository.save(existing);
    }

    public Parent update(Long id, Parent update) {
        Parent existing = getById(id);
        existing.setFullName(update.getFullName());
        existing.setPhone(update.getPhone());
        if (update.getEmail() == null || update.getEmail().isEmpty()) {
            existing.setEmail(generateEmail(existing.getFullName()));
        } else {
            existing.setEmail(update.getEmail());
        }
        existing.setJob(update.getJob());
        return parentRepository.save(existing);
    }

    public void delete(Long id) {
        parentRepository.deleteById(id);
    }
}
