package com.schoolmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
public class Score {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    private Double oral1;
    private Double test15_1;
    private Double mid1;
    private Double final1;
    private Double oral2;
    private Double test15_2;
    private Double mid2;
    private Double final2;

    @Transient
    public Double getAverage() {
        double total = 0;
        int count = 0;

        if (oral1 != null) {
            total += oral1;
            count++;
        }
        if (test15_1 != null) {
            total += test15_1;
            count++;
        }
        if (mid1 != null) {
            total += mid1 * 2;
            count += 2;
        }
        if (final1 != null) {
            total += final1 * 3;
            count += 3;
        }

        return count == 0 ? 0 : total / count;
    }

    public Score() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public Double getOral1() {
        return oral1;
    }

    public void setOral1(Double oral1) {
        this.oral1 = oral1;
    }

    public Double getTest15_1() {
        return test15_1;
    }

    public void setTest15_1(Double test15_1) {
        this.test15_1 = test15_1;
    }

    public Double getMid1() {
        return mid1;
    }

    public void setMid1(Double mid1) {
        this.mid1 = mid1;
    }

    public Double getFinal1() {
        return final1;
    }

    public void setFinal1(Double final1) {
        this.final1 = final1;
    }

    public Double getOral2() {
        return oral2;
    }

    public void setOral2(Double oral2) {
        this.oral2 = oral2;
    }

    public Double getTest15_2() {
        return test15_2;
    }

    public void setTest15_2(Double test15_2) {
        this.test15_2 = test15_2;
    }

    public Double getMid2() {
        return mid2;
    }

    public void setMid2(Double mid2) {
        this.mid2 = mid2;
    }

    public Double getFinal2() {
        return final2;
    }

    public void setFinal2(Double final2) {
        this.final2 = final2;
    }
}
