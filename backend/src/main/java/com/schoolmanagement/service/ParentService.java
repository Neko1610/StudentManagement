package com.schoolmanagement.service;

import com.schoolmanagement.entity.Parent;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.entity.Role;
import com.schoolmanagement.repository.ParentRepository;
import com.schoolmanagement.repository.UserRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class ParentService {

    private final ParentRepository parentRepository;
    private final UserRepository userRepository;

    public ParentService(ParentRepository parentRepository,
            UserRepository userRepository) {
        this.parentRepository = parentRepository;
        this.userRepository = userRepository;
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

    public Parent updateByEmail(String email, Parent update) {

        Parent existing = parentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));

        existing.setFullName(update.getFullName());
        existing.setPhone(update.getPhone());
        existing.setJob(update.getJob());
        existing.setAddress(update.getAddress());
        existing.setGender(update.getGender());

        return parentRepository.save(existing);
    }

    public Parent getById(Long id) {
        return parentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));
    }

    // ================= CREATE =================
    public Parent create(Parent parent) {

        if (parent.getEmail() == null || parent.getEmail().isEmpty()) {
            throw new RuntimeException("EMAIL_REQUIRED");
        }

        String email = parent.getEmail().trim().toLowerCase();

        if (userRepository.findByUsername(email).isPresent()) {
            throw new RuntimeException("EMAIL_EXISTS");
        }

        parent.setEmail(email);

        Parent saved = parentRepository.save(parent);

        // 🔥 CREATE USER
        try {
            User user = new User();
            user.setUsername(email);
            user.setPassword("123");
            user.setRole(Role.PARENT);

            userRepository.save(user);
        } catch (Exception ignored) {
        }

        return saved;
    }

    // ================= UPDATE =================
    public Parent update(Long id, Parent update) {
        Parent existing = getById(id);

        existing.setFullName(update.getFullName());
        existing.setJob(update.getJob());
        existing.setPhone(update.getPhone());
        existing.setAddress(update.getAddress());
        existing.setGender(update.getGender());

        if (update.getEmail() != null && !update.getEmail().isEmpty()) {

            String newEmail = update.getEmail().trim().toLowerCase();

            if (userRepository.findByUsername(newEmail).isPresent()
                    && !newEmail.equals(existing.getEmail())) {
                throw new RuntimeException("EMAIL_EXISTS");
            }

            // 🔥 update username
            userRepository.findByUsername(existing.getEmail())
                    .ifPresent(user -> {
                        user.setUsername(newEmail);
                        userRepository.save(user);
                    });

            existing.setEmail(newEmail);
        }

        return parentRepository.save(existing);
    }

    // ================= DELETE =================
    public void delete(Long id) {
        Parent parent = getById(id);

        if (parent.getEmail() != null) {
            userRepository.findByUsername(parent.getEmail())
                    .ifPresent(userRepository::delete);
        }

        parentRepository.deleteById(id);
    }
}
