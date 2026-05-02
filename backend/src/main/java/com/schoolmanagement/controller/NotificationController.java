package com.schoolmanagement.controller;

import com.schoolmanagement.dto.NotificationRequest;
import com.schoolmanagement.entity.Notification;
import com.schoolmanagement.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAll() {
        return ResponseEntity.ok(notificationService.getAll());
    }

    @GetMapping("/me")
    public ResponseEntity<List<Notification>> getMine(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(notificationService.getForUser(userId, role));
    }

    @GetMapping("/recipient/{recipientId}")
    public ResponseEntity<List<Notification>> getByRecipient(@PathVariable Long recipientId) {
        return ResponseEntity.ok(notificationService.getForUser(recipientId, null));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<Notification>> getByRole(@PathVariable String role) {
        return ResponseEntity.ok(notificationService.getByRole(role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getById(id));
    }

    @PostMapping
    public ResponseEntity<List<Notification>> create(
            @Valid @RequestBody NotificationRequest request,
            Authentication authentication) {
        applyAuthenticatedSender(request, authentication);
        return ResponseEntity.ok(notificationService.send(request));
    }

    @PostMapping("/raw")
    public ResponseEntity<Notification> createRaw(@Valid @RequestBody Notification notification) {
        return ResponseEntity.ok(notificationService.create(notification));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<Notification> update(@PathVariable Long id, @Valid @RequestBody Notification notification) {
        return ResponseEntity.ok(notificationService.update(id, notification));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void applyAuthenticatedSender(NotificationRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return;
        }
        if (request.getSenderEmail() == null || request.getSenderEmail().isBlank()) {
            request.setSenderEmail(authentication.getName());
        }
        authentication.getAuthorities().stream()
                .findFirst()
                .ifPresent(authority -> request.setSenderRole(authority.getAuthority().replace("ROLE_", "")));
    }
}
