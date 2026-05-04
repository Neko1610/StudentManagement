package com.schoolmanagement.service;

import com.schoolmanagement.entity.ActivityLog;
import com.schoolmanagement.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository repository;

    public ActivityLogService(ActivityLogRepository repository) {
        this.repository = repository;
    }

    public void log(String user, String role, String action,
                    String target, String className, String status) {

        ActivityLog log = ActivityLog.builder()
                .userName(user)
                .role(role)
                .action(action)
                .target(target)
                .className(className)
                .status(status)
                .build();

        repository.save(log);
    }

    public List<ActivityLog> getRecent() {
        return repository.findTop10ByOrderByCreatedAtDesc();
    }
}