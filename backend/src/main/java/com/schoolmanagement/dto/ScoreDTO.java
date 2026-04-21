package com.schoolmanagement.dto;

import lombok.Data;

@Data
public class ScoreDTO {
    private Long id;
    private String subjectName;
    private Double assignmentScore;
    private Double midtermScore;
    private Double finalScore;
    private Double averageScore;

    // getter setter
}