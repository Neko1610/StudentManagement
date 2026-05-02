package com.schoolmanagement.service;

import com.schoolmanagement.dto.ScoreDTO;
import com.schoolmanagement.entity.Assignment;
import com.schoolmanagement.entity.Score;
import com.schoolmanagement.entity.ScoreType;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.Subject;
import com.schoolmanagement.entity.Submission;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.repository.ScoreRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Objects;

@Service
public class ScoreService {
    private final ScoreRepository scoreRepository;
    private final StudentRepository studentRepository;
    private final ScoreExportService scoreExportService;
    private final TeacherRepository teacherRepository;

    public ScoreService(ScoreRepository scoreRepository, StudentRepository studentRepository,
            ScoreExportService scoreExportService, TeacherRepository teacherRepository) {
        this.scoreRepository = scoreRepository;
        this.studentRepository = studentRepository;
        this.scoreExportService = scoreExportService;
        this.teacherRepository = teacherRepository;

    }

    private double safe(Double v) {
        return v == null ? 0 : v;
    }

    public List<Score> getAll() {
        return scoreRepository.findAll();
    }

    public List<Score> getByClassId(Long classId) {
        return scoreRepository.findByStudent_StudentClass_Id(classId);
    }

    private double calcGPA(Double oral, Double test, Double mid, Double fin) {
        double o = oral == null ? 0 : oral;
        double t = test == null ? 0 : test;
        double m = mid == null ? 0 : mid;
        double f = fin == null ? 0 : fin;

        return (o + t + m * 2 + f * 3) / 7;
    }

    public double calcOverallGPA(List<Score> scores, int semester) {
        double total = 0;
        int count = 0;

        for (Score s : scores) {
            double gpa = semester == 1
                    ? calcGPA(s.getOral1(), s.getTest15_1(), s.getMid1(), s.getFinal1())
                    : calcGPA(s.getOral2(), s.getTest15_2(), s.getMid2(), s.getFinal2());

            if (gpa > 0) {
                total += gpa;
                count++;
            }
        }

        return count == 0 ? 0 : total / count;
    }

    public List<ScoreDTO> getByStudentAndTeacher(Long studentId, String email) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // 🔥 lấy teacher
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Long subjectId = teacher.getSubject().getId();

        List<Score> list = scoreRepository.findByStudent(student)
                .stream()
                .filter(s -> s.getSubject().getId().equals(subjectId))
                .toList();

        return list.stream().map(s -> {
            ScoreDTO dto = new ScoreDTO();

            dto.setId(s.getId());
            dto.setSubjectName(s.getSubject().getName());

            dto.setOral1(s.getOral1());
            dto.setTest15_1(s.getTest15_1());
            dto.setMid1(s.getMid1());
            dto.setFinal1(s.getFinal1());

            dto.setOral2(s.getOral2());
            dto.setTest15_2(s.getTest15_2());
            dto.setMid2(s.getMid2());
            dto.setFinal2(s.getFinal2());

            return dto;
        }).toList();
    }

    public List<ScoreDTO> getByStudentId(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<Score> list = scoreRepository.findByStudent(student);

        return list.stream().map(s -> {
            ScoreDTO dto = new ScoreDTO();

            dto.setId(s.getId());
            dto.setSubjectName(s.getSubject().getName());

            // HK1
            dto.setOral1(s.getOral1());
            dto.setTest15_1(s.getTest15_1());
            dto.setMid1(s.getMid1());
            dto.setFinal1(s.getFinal1());

            // HK2
            dto.setOral2(s.getOral2());
            dto.setTest15_2(s.getTest15_2());
            dto.setMid2(s.getMid2());
            dto.setFinal2(s.getFinal2());

            return dto;
        }).toList();
    }

    public List<ScoreDTO> getByClassAndTeacher(Long classId, String email) {

        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Long subjectId = teacher.getSubject().getId();

        return scoreRepository.findByStudent_StudentClass_Id(classId) // 🔥 FIX
                .stream()
                .filter(s -> s.getSubject().getId().equals(subjectId))
                .map(this::toDTO)
                .toList();
    }

    private ScoreDTO toDTO(Score s) {
        ScoreDTO dto = new ScoreDTO();

        dto.setId(s.getId());
        dto.setSubjectName(s.getSubject().getName());
        dto.setStudentId(s.getStudent().getId());
        // HK1
        dto.setOral1(s.getOral1());
        dto.setTest15_1(s.getTest15_1());
        dto.setMid1(s.getMid1());
        dto.setFinal1(s.getFinal1());

        // HK2
        dto.setOral2(s.getOral2());
        dto.setTest15_2(s.getTest15_2());
        dto.setMid2(s.getMid2());
        dto.setFinal2(s.getFinal2());

        return dto;
    }

    public Score getById(Long id) {
        return scoreRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Score not found"));
    }

    public Score create(Score score) {

        boolean exists = scoreRepository.existsByStudentIdAndSubjectIdAndSemester(
                score.getStudent().getId(),
                score.getSubject().getId(),
                score.getSemester());

        if (exists) {
            throw new RuntimeException("Score already exists → use update!");
        }

        return scoreRepository.save(score);
    }

    public Score update(Long id, Score updated, Integer semester) {
        Score current = getById(id);

        if (semester == 1) {
            current.setOral1(updated.getOral1());
            current.setTest15_1(updated.getTest15_1());
            current.setMid1(updated.getMid1());
            current.setFinal1(updated.getFinal1());
        } else {
            current.setOral2(updated.getOral2());
            current.setTest15_2(updated.getTest15_2());
            current.setMid2(updated.getMid2());
            current.setFinal2(updated.getFinal2());
        }

        return scoreRepository.save(current);
    }

    @Transactional
    public Score updateFromSubmission(Submission submission, Integer semester, Double previousSubmissionScore) {

        Assignment assignment = submission.getAssignment();
        Integer realSemester = assignment.getSemester();

        validateSemester(realSemester);

        if (submission.getScore() == null) {
            throw new IllegalArgumentException("Submission score is required");
        }

        ScoreType type = assignment.getType();
        Student student = submission.getStudent();
        Subject subject = resolveSubject(assignment);

        Score score = scoreRepository
                .findByStudentIdAndSubjectIdAndSemester(
                        student.getId(),
                        subject.getId(),
                        realSemester)
                .orElseGet(() -> {
                    Score created = new Score();
                    created.setStudent(student);
                    created.setSubject(subject);
                    created.setSemester(realSemester);
                    return created;
                });

        applySubmissionScore(score, type, realSemester, submission.getScore(), previousSubmissionScore);

        return scoreRepository.save(score);
    }

    private Subject resolveSubject(Assignment assignment) {
        if (assignment.getTeacher() == null || assignment.getTeacher().getSubject() == null
                || assignment.getTeacher().getSubject().getId() == null) {
            throw new IllegalStateException("Assignment teacher subject is required");
        }

        return assignment.getTeacher().getSubject();
    }

    private void applySubmissionScore(
            Score score,
            ScoreType type,
            Integer semester,
            Double value,
            Double previousSubmissionScore) {

        switch (type) {
            case ORAL -> applyOral(score, semester, value, previousSubmissionScore);
            case TEST15 -> applyTest15(score, semester, value, previousSubmissionScore);
            case MID -> {
                if (semester == 1) {
                    score.setMid1(value);
                } else {
                    score.setMid2(value);
                }
            }
            case FINAL -> {
                if (semester == 1) {
                    score.setFinal1(value);
                } else {
                    score.setFinal2(value);
                }
            }
        }
    }

    private void applyOral(Score score, Integer semester, Double value, Double previousSubmissionScore) {
        if (semester == 1) {
            if (score.getOral1() == null || Objects.equals(score.getOral1(), previousSubmissionScore)) {
                score.setOral1(value);
            } else {
                score.setOral2(value);
            }
        } else {
            score.setOral2(value);
        }
    }

    private void applyTest15(Score score, Integer semester, Double value, Double previousSubmissionScore) {
        if (semester == 1) {
            if (score.getTest15_1() == null || Objects.equals(score.getTest15_1(), previousSubmissionScore)) {
                score.setTest15_1(value);
            } else {
                score.setTest15_2(value);
            }
        } else {
            score.setTest15_2(value);
        }
    }

    private void validateSemester(Integer semester) {
        if (semester == null || (semester != 1 && semester != 2)) {
            throw new IllegalArgumentException("Semester must be 1 or 2");
        }
    }

    public void delete(Long id) {
        scoreRepository.deleteById(id);
    }

    public byte[] exportByStudent(Long studentId) throws IOException {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<Score> scores = scoreRepository.findByStudent(student);

        return scoreExportService.export(scores);
    }

    public byte[] exportByClass(Long classId, Integer semester) throws IOException {

        List<Score> scores = scoreRepository.findByStudent_StudentClass_Id(classId);

        // 🔥 set lại dữ liệu theo học kì
        for (Score s : scores) {
            if (semester == 1) {
                s.setOral2(null);
                s.setTest15_2(null);
                s.setMid2(null);
                s.setFinal2(null);
            } else {
                s.setOral1(null);
                s.setTest15_1(null);
                s.setMid1(null);
                s.setFinal1(null);
            }
        }

        return scoreExportService.export(scores);
    }

    public byte[] exportPdf(Long classId, Integer semester) {
        try {
            List<Score> scores = scoreRepository.findByStudent_StudentClass_Id(classId);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            com.lowagie.text.Document doc = new com.lowagie.text.Document();
            com.lowagie.text.pdf.PdfWriter.getInstance(doc, out);

            doc.open();
            doc.add(new com.lowagie.text.Paragraph("BẢNG ĐIỂM"));

            for (Score s : scores) {
                double oral = semester == 1 ? safe(s.getOral1()) : safe(s.getOral2());
                double test = semester == 1 ? safe(s.getTest15_1()) : safe(s.getTest15_2());
                double mid = semester == 1 ? safe(s.getMid1()) : safe(s.getMid2());
                double fin = semester == 1 ? safe(s.getFinal1()) : safe(s.getFinal2());

                double avg = (oral + test + mid * 2 + fin * 3) / 6;

                doc.add(new com.lowagie.text.Paragraph(
                        s.getStudent().getFullName() +
                                " | " + oral +
                                " | " + test +
                                " | " + mid +
                                " | " + fin +
                                " | " + String.format("%.1f", avg)));
            }

            doc.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("PDF_ERROR");
        }
    }

    public byte[] exportPdfByStudent(Long studentId) {
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            List<Score> scores = scoreRepository.findByStudent(student);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            com.lowagie.text.Document doc = new com.lowagie.text.Document();
            com.lowagie.text.pdf.PdfWriter.getInstance(doc, out);

            doc.open();
            doc.add(new com.lowagie.text.Paragraph("STUDENT SCORE REPORT"));
            doc.add(new com.lowagie.text.Paragraph(student.getFullName()));

            for (Score s : scores) {
                doc.add(new com.lowagie.text.Paragraph(
                        s.getSubject().getName()
                                + " | Oral: " + safe(s.getOral1())
                                + " | 15m: " + safe(s.getTest15_1())
                                + " | Mid: " + safe(s.getMid1())
                                + " | Final: " + safe(s.getFinal1())));
            }

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF_ERROR");
        }
    }

    public byte[] exportAll() throws IOException {
        List<Score> scores = scoreRepository.findAll();
        return scoreExportService.export(scores);
    }
}
