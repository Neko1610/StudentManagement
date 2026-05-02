package com.schoolmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Teacher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String phone;
    @NotBlank
    private String fullName;

    private LocalDate dob;

    private String degree;
    @ManyToMany(mappedBy = "teachers")
    @JsonIgnore
    private Set<Clazz> classes = new HashSet<>();
    private String email;
    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    public Teacher() {
    }

    public Long getId() {
        return id;
    }

    @Transient
    private String subjectName;

    @Transient
    private String homeroomClassName;
    @Transient
    private Long subjectId;

    @Transient
    private Long homeroomClassId;
    private String qualifications;

    public String getQualifications() {
        return qualifications;
    }

    public void setQualifications(String qualifications) {
        this.qualifications = qualifications;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getDob() {
        return dob;
    }

    public void setDob(LocalDate dob) {
        this.dob = dob;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getHomeroomClassName() {
        return homeroomClassName;
    }

    public void setHomeroomClassName(String homeroomClassName) {
        this.homeroomClassName = homeroomClassName;
    }

    // 👉 subjectId
    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    // 👉 homeroomClassId
    public Long getHomeroomClassId() {
        return homeroomClassId;
    }

    public void setHomeroomClassId(Long homeroomClassId) {
        this.homeroomClassId = homeroomClassId;
    }
}
