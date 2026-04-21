package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRoleTarget(String roleTarget);
}
