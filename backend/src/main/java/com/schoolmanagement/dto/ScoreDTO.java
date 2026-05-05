package com.schoolmanagement.dto;

import lombok.Data;

@Data
public class ScoreDTO {

    private Long id;
    private Long studentId;
    private Long subjectId;
    private Integer semester;
    private String subjectName;

    // HK1
    private Double oral1;
    private Double test15_1;
    private Double mid1;
    private Double final1;
    private Double gpa1; 

    // HK2
    private Double oral2;
    private Double test15_2;
    private Double mid2;
    private Double final2;
    private Double gpa2; 
}
