package com.schoolmanagement.controller;

import com.schoolmanagement.dto.ParentRequestDTO;
import com.schoolmanagement.entity.ParentRequest;
import com.schoolmanagement.service.ParentRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/requests")
@CrossOrigin(origins = "*")
public class ParentRequestController {
    private final ParentRequestService parentRequestService;

    public ParentRequestController(ParentRequestService parentRequestService) {
        this.parentRequestService = parentRequestService;
    }

    @PostMapping
    public ResponseEntity<ParentRequest> create(@Valid @RequestBody ParentRequestDTO request,
            Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getName())
                && (request.getParentEmail() == null || request.getParentEmail().isBlank())) {
            request.setParentEmail(authentication.getName());
        }
        return ResponseEntity.ok(parentRequestService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<ParentRequest>> getRequests(
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) String teacherEmail,
            @RequestParam(required = false) Long parentId) {
        return ResponseEntity.ok(parentRequestService.getRequests(teacherId, teacherEmail, parentId));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ParentRequest>> getMine(Authentication authentication) {
        String email = authentication.getName();

        return ResponseEntity.ok(
                parentRequestService.getByParentEmail(email));
    }

    @GetMapping("/teacher")
    public ResponseEntity<List<ParentRequest>> getForTeacher(
            @RequestParam(required = false) String teacherEmail,
            @RequestParam(required = false) Long teacherId) {
        return ResponseEntity.ok(parentRequestService.getForTeacher(teacherEmail, teacherId));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ParentRequest> approve(@PathVariable Long id) {
        return ResponseEntity.ok(parentRequestService.approve(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ParentRequest> reject(@PathVariable Long id) {
        return ResponseEntity.ok(parentRequestService.reject(id));
    }
}
