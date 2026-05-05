package com.schoolmanagement.service;

import com.schoolmanagement.dto.ParentRequestDTO;
import com.schoolmanagement.entity.Clazz;
import com.schoolmanagement.entity.Parent;
import com.schoolmanagement.entity.ParentRequest;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.repository.ParentRepository;
import com.schoolmanagement.repository.ParentRequestRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.util.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class ParentRequestService {
    private final ParentRequestRepository parentRequestRepository;
    private final ParentRepository parentRepository;
    private final TeacherRepository teacherRepository;
    @Autowired
    private ActivityLogService activityLogService;

    public ParentRequestService(
            ParentRequestRepository parentRequestRepository,
            ParentRepository parentRepository,
            TeacherRepository teacherRepository) {
        this.parentRequestRepository = parentRequestRepository;
        this.parentRepository = parentRepository;
        this.teacherRepository = teacherRepository;
    }

    @Transactional
    public ParentRequest create(ParentRequestDTO dto) {
        Parent parent = resolveParent(dto);
        Teacher homeroomTeacher = resolveHomeroomTeacher(parent);
        String requestType = normalize(dto.getRequestType());

        if (!List.of("LEAVE", "MESSAGE").contains(requestType)) {
            throw new IllegalArgumentException("requestType must be LEAVE or MESSAGE");
        }
        if ("LEAVE".equals(requestType) && (dto.getStartDate() == null || dto.getEndDate() == null)) {
            throw new IllegalArgumentException("startDate and endDate are required for leave requests");
        }

        ParentRequest request = new ParentRequest();
        request.setParentId(parent.getId());
        request.setTeacherId(homeroomTeacher.getId());
        request.setRequestType(requestType);
        request.setContent(dto.getContent());
        request.setStartDate(dto.getStartDate());
        request.setEndDate(dto.getEndDate());
        request.setStatus("PENDING");
        return parentRequestRepository.save(request);

    }

    public List<ParentRequest> getRequests(Long teacherId, String teacherEmail, Long parentId) {
        List<ParentRequest> requests;
        if (parentId != null) {
            requests = parentRequestRepository.findByParentIdOrderByCreatedAtDesc(parentId);
            attachParentNames(requests);
            return requests;
        }

        if (teacherEmail != null && !teacherEmail.isBlank()) {
            Teacher teacher = teacherRepository.findByEmail(teacherEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            requests = parentRequestRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getId());
            attachParentNames(requests);
            return requests;
        }

        if (teacherId != null) {
            requests = parentRequestRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId);
            attachParentNames(requests);
            return requests;
        }

        requests = parentRequestRepository.findAllByOrderByCreatedAtDesc();
        attachParentNames(requests);
        return requests;
    }

    public List<ParentRequest> getForTeacher(String teacherEmail, Long teacherId) {
        return getRequests(teacherId, teacherEmail, null);
    }

    public ParentRequest approve(Long id) {
        return updateStatus(id, "APPROVED");
    }

    public ParentRequest reject(Long id) {
        return updateStatus(id, "REJECTED");
    }

    private ParentRequest updateStatus(Long id, String status) {
        ParentRequest request = parentRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        request.setStatus(status);
        ParentRequest saved = parentRequestRepository.save(request);
        attachParentName(saved);
        return saved;
    }

    private void attachParentNames(List<ParentRequest> requests) {
        for (ParentRequest request : requests) {
            attachParentName(request);
        }
    }

    private void attachParentName(ParentRequest request) {
        if (request.getParentId() == null) {
            return;
        }
        parentRepository.findById(request.getParentId())
                .ifPresent(parent -> request.setParentName(parent.getFullName()));
    }

    public List<ParentRequest> getByParentEmail(String email) {
        Parent parent = parentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));

        List<ParentRequest> requests = parentRequestRepository.findByParentIdOrderByCreatedAtDesc(parent.getId());

        attachParentNames(requests);
        return requests;
    }

    private Parent resolveParent(ParentRequestDTO dto) {
        if (dto.getParentEmail() != null && !dto.getParentEmail().isBlank()) {
            return parentRepository.findByEmail(dto.getParentEmail())
                    .orElseGet(() -> resolveParentById(dto.getParentId()));
        }
        return resolveParentById(dto.getParentId());
    }

    private Parent resolveParentById(Long parentId) {
        if (parentId == null) {
            throw new IllegalArgumentException("parentId or parentEmail is required");
        }
        return parentRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));
    }

    private Teacher resolveHomeroomTeacher(Parent parent) {
        for (Student student : parent.getStudents()) {
            Clazz clazz = student.getStudentClass();
            if (clazz != null && clazz.getHomeroomTeacher() != null) {
                return clazz.getHomeroomTeacher();
            }
        }
        throw new IllegalArgumentException("No homeroom teacher found for parent's child");
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }
}
