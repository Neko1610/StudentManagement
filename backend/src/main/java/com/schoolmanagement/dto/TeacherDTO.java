package com.schoolmanagement.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TeacherDTO {

    private Long id;
    private String fullName;
    private String email;

    private LocalDate dob;
    private String degree;

    private Long subjectId;
    private String subjectName;

    private Long classId;
    private String className;
}