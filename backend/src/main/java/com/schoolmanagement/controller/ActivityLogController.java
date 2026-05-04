package com.schoolmanagement.controller;

import com.schoolmanagement.entity.ActivityLog;
import com.schoolmanagement.service.ActivityLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin("*")
public class ActivityLogController {

    private final ActivityLogService service;

    public ActivityLogController(ActivityLogService service) {
        this.service = service;
    }

    @GetMapping("/activity")
    public List<ActivityLog> getActivity() {
        return service.getRecent();
    }
}