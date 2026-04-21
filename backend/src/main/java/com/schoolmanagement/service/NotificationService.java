package com.schoolmanagement.service;

import com.schoolmanagement.entity.Notification;
import com.schoolmanagement.repository.NotificationRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getAll() {
        return notificationRepository.findAll();
    }

    public List<Notification> getByRole(String role) {
        return notificationRepository.findByRoleTarget(role);
    }

    public Notification getById(Long id) {
        return notificationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
    }

    public Notification create(Notification notification) {
        return notificationRepository.save(notification);
    }

    public Notification update(Long id, Notification notification) {
        Notification existing = getById(id);
        existing.setTitle(notification.getTitle());
        existing.setContent(notification.getContent());
        existing.setSenderId(notification.getSenderId());
        existing.setRoleTarget(notification.getRoleTarget());
        return notificationRepository.save(existing);
    }

    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }
}
