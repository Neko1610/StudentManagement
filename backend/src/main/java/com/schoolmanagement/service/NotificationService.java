package com.schoolmanagement.service;

import com.schoolmanagement.dto.NotificationRequest;
import com.schoolmanagement.entity.Clazz;
import com.schoolmanagement.entity.Notification;
import com.schoolmanagement.entity.Parent;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.repository.ClazzRepository;
import com.schoolmanagement.repository.NotificationRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final TeacherRepository teacherRepository;
    private final ClazzRepository clazzRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            TeacherRepository teacherRepository,
            ClazzRepository clazzRepository) {
        this.notificationRepository = notificationRepository;
        this.teacherRepository = teacherRepository;
        this.clazzRepository = clazzRepository;
    }

    public List<Notification> getAll() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Notification> getByRole(String role) {
        return notificationRepository.findByRoleTarget(normalizeRole(role));
    }

    public List<Notification> getForUser(Long userId, String role) {
        if (userId == null && (role == null || role.isBlank())) {
            return getAll();
        }

        List<String> roleTargets = new ArrayList<>();
        roleTargets.add("ALL");
        if (role != null && !role.isBlank()) {
            roleTargets.add(normalizeRole(role));
        }

        return notificationRepository.findByReceiverIdOrRoleTargetInOrderByCreatedAtDesc(userId, roleTargets);
    }

    public Notification getById(Long id) {
        return notificationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
    }

    public Notification create(Notification notification) {
        if (notification.getType() == null || notification.getType().isBlank()) {
            notification.setType("INFO");
        }
        return notificationRepository.save(notification);
    }

    @Transactional
    public List<Notification> send(NotificationRequest request) {
        validateNotificationRequest(request);

        String senderRole = normalizeRole(request.getSenderRole());
        if ("ADMIN".equals(senderRole)) {
            return sendAsAdmin(request);
        }

        if ("TEACHER".equals(senderRole)) {
            return sendAsTeacher(request);
        }

        throw new IllegalArgumentException("Only ADMIN and TEACHER can send notifications");
    }

    public Notification update(Long id, Notification notification) {
        Notification existing = getById(id);
        existing.setTitle(notification.getTitle());
        existing.setContent(notification.getContent());
        existing.setSenderId(notification.getSenderId());
        existing.setRoleTarget(notification.getRoleTarget());
        existing.setReceiverId(notification.getReceiverId());
        existing.setType(notification.getType());
        existing.setIsRead(notification.getIsRead());
        return notificationRepository.save(existing);
    }

    public Notification markAsRead(Long id) {
        Notification existing = getById(id);
        existing.setIsRead(true);
        return notificationRepository.save(existing);
    }

    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }

    private List<Notification> sendAsAdmin(NotificationRequest request) {
        String recipientType = normalizeRecipientType(request.getRecipientType());

        if ("SPECIFIC".equals(recipientType)) {
            Long receiverId = request.getUserId() != null ? request.getUserId() : request.getRecipientId();
            if (receiverId == null) {
                throw new IllegalArgumentException("userId is required for SPECIFIC notifications");
            }
            return List.of(notificationRepository.save(buildNotification(request, null, receiverId)));
        }

        String roleTarget = switch (recipientType) {
            case "ALL" -> "ALL";
            case "STUDENT" -> "STUDENT";
            case "TEACHER" -> "TEACHER";
            case "PARENT" -> "PARENT";
            default -> throw new IllegalArgumentException("Invalid recipientType for admin");
        };

        return List.of(notificationRepository.save(buildNotification(request, roleTarget, null)));
    }

    private List<Notification> sendAsTeacher(NotificationRequest request) {
        String recipientType = normalizeRecipientType(request.getRecipientType());
        if (!"STUDENT".equals(recipientType) && !"PARENT".equals(recipientType)) {
            throw new IllegalArgumentException("Teacher can only send to students or parents in assigned classes");
        }

        Teacher teacher = resolveTeacher(request);
        Set<Clazz> classes = new LinkedHashSet<>();
        classes.addAll(clazzRepository.findByHomeroomTeacherId(teacher.getId()));
        classes.addAll(clazzRepository.findByTeachers_Id(teacher.getId()));

        if (classes.isEmpty()) {
            throw new IllegalArgumentException("Teacher has no assigned classes");
        }

        List<Notification> notifications = new ArrayList<>();
        for (Clazz clazz : classes) {
            for (Student student : clazz.getStudents()) {
                if ("STUDENT".equals(recipientType)) {
                    notifications.add(buildNotification(request, "STUDENT", student.getId()));
                } else {
                    for (Parent parent : student.getParents()) {
                        notifications.add(buildNotification(request, "PARENT", parent.getId()));
                    }
                }
            }
        }

        return notificationRepository.saveAll(notifications);
    }

    private Teacher resolveTeacher(NotificationRequest request) {
        if (request.getSenderEmail() != null && !request.getSenderEmail().isBlank()) {
            return teacherRepository.findByEmail(request.getSenderEmail())
                    .orElseGet(() -> resolveTeacherById(request.getSenderId()));
        }
        return resolveTeacherById(request.getSenderId());
    }

    private Teacher resolveTeacherById(Long teacherId) {
        if (teacherId == null) {
            throw new IllegalArgumentException("Teacher senderId or senderEmail is required");
        }
        return teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
    }

    private Notification buildNotification(NotificationRequest request, String roleTarget, Long receiverId) {
        Notification notification = new Notification();
        notification.setTitle(request.getTitle());
        notification.setContent(request.getMessage());
        notification.setSenderId(request.getSenderId());
        notification.setRoleTarget(roleTarget);
        notification.setReceiverId(receiverId);
        notification.setType(normalizeType(request.getType()));
        notification.setIsRead(false);
        return notification;
    }

    private void validateNotificationRequest(NotificationRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("title is required");
        }
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new IllegalArgumentException("message is required");
        }
    }

    private String normalizeRecipientType(String value) {
        String normalized = normalizeRole(value);
        return switch (normalized) {
            case "STUDENTS" -> "STUDENT";
            case "TEACHERS" -> "TEACHER";
            case "PARENTS" -> "PARENT";
            default -> normalized;
        };
    }

    private String normalizeRole(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("ROLE_", "").trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeType(String value) {
        String type = normalizeRole(value);
        if (type.isBlank()) {
            return "INFO";
        }
        if ("ALERT".equals(type)) {
            return "IMPORTANT";
        }
        if (!List.of("INFO", "WARNING", "IMPORTANT").contains(type)) {
            throw new IllegalArgumentException("type must be INFO, WARNING, or IMPORTANT");
        }
        return type;
    }
}
