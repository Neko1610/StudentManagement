package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRoleTarget(String roleTarget);

    List<Notification> findByReceiverId(Long receiverId);

    List<Notification> findByReceiverIdOrRoleTargetInOrderByCreatedAtDesc(Long receiverId, List<String> roleTargets);

    List<Notification> findAllByOrderByCreatedAtDesc();
}
