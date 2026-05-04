package com.schoolmanagement.service;

import com.schoolmanagement.dto.AuthResponse;
import com.schoolmanagement.entity.User;
import com.schoolmanagement.repository.ParentRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.repository.UserRepository;
import com.schoolmanagement.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            UserRepository userRepository,
            TeacherRepository teacherRepository,
            StudentRepository studentRepository,
            ParentRepository parentRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.parentRepository = parentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(String username, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password));
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
            String token = jwtUtil.generateToken(username, user.getRole().name());
            return buildResponse(token, user);
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    private AuthResponse buildResponse(String token, User user) {
        return switch (user.getRole()) {
            case TEACHER -> teacherRepository.findByEmail(user.getUsername())
                    .map(teacher -> new AuthResponse(token, user.getRole().name(), teacher.getId(), teacher.getEmail(),
                            teacher.getFullName()))
                    .orElse(new AuthResponse(token, user.getRole().name(), user.getId(), user.getUsername(),
                            user.getUsername()));
            case STUDENT -> studentRepository.findByEmail(user.getUsername())
                    .map(student -> new AuthResponse(token, user.getRole().name(), student.getId(), student.getEmail(),
                            student.getFullName()))
                    .orElse(new AuthResponse(token, user.getRole().name(), user.getId(), user.getUsername(),
                            user.getUsername()));
            case PARENT -> parentRepository.findByEmail(user.getUsername())
                    .map(parent -> new AuthResponse(token, user.getRole().name(), parent.getId(), parent.getEmail(),
                            parent.getFullName()))
                    .orElse(new AuthResponse(token, user.getRole().name(), user.getId(), user.getUsername(),
                            user.getUsername()));
            case ADMIN ->
                new AuthResponse(token, user.getRole().name(), user.getId(), user.getUsername(), user.getUsername());
        };
    }
     public void changePassword(String oldPassword, String newPassword) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));


        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadCredentialsException("Old password incorrect");
        }


        if (newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }


        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
