package com.schoolmanagement.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
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
import com.schoolmanagement.repository.ClazzRepository;
import com.schoolmanagement.util.ResourceNotFoundException;

import org.apache.poi.ss.usermodel.Color;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.schoolmanagement.entity.Clazz;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class ScoreService {
    private final ScoreRepository scoreRepository;
    private final StudentRepository studentRepository;
    private final ScoreExportService scoreExportService;
    private final TeacherRepository teacherRepository;
    private final ClazzRepository classRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public ScoreService(ScoreRepository scoreRepository, StudentRepository studentRepository,
            ScoreExportService scoreExportService, TeacherRepository teacherRepository,
            ClazzRepository classRepository) {
        this.scoreRepository = scoreRepository;
        this.studentRepository = studentRepository;
        this.scoreExportService = scoreExportService;
        this.teacherRepository = teacherRepository;
        this.classRepository = classRepository;

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

    public byte[] exportTeacher(Long classId, Integer semester, String email) throws IOException {

        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (teacher.getSubject() == null) {
            throw new RuntimeException("Teacher chưa có môn");
        }

        Long subjectId = teacher.getSubject().getId();

        List<Score> scores = scoreRepository.findByStudent_StudentClass_Id(classId)
                .stream()
                .filter(s -> s != null)
                .filter(s -> s.getSemester() != null && s.getSemester().equals(semester))
                .filter(s -> s.getSubject() != null && s.getSubject().getId().equals(subjectId))
                .toList();

        // 🔥 tránh crash Excel
        if (scores.isEmpty()) {
            return scoreExportService.exportTeacher(new ArrayList<>(), semester, teacher);
        }

        return scoreExportService.exportTeacher(scores, semester, teacher);
    }

    public byte[] exportByClass(Long classId, Integer semester) throws IOException {

        List<Score> scores = scoreRepository.findByStudent_StudentClass_Id(classId);

        return scoreExportService.export(scores, semester);
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
        dto.setSubjectId(s.getSubject().getId());
        dto.setSemester(s.getSemester());
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

        // 🔥 LOAD STUDENT THẬT
        Student student = studentRepository.findById(score.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        score.setStudent(student);

        Score saved = scoreRepository.save(score);

        activityLogService.log(
                "Teacher",
                "TEACHER",
                "Entered Scores",
                student.getFullName(),
                student.getStudentClass() != null
                        ? student.getStudentClass().getName()
                        : "N/A",
                "Updated");

        return saved;
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

        Score saved = scoreRepository.save(current);

        activityLogService.log(
                "Teacher",
                "TEACHER",
                "Updated Scores",
                current.getStudent().getFullName(),
                current.getStudent().getStudentClass().getName(),
                "Updated");

        return saved;
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

    public byte[] exportByStudent(Long studentId, Integer semester) throws IOException {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<Score> scores = scoreRepository.findByStudent(student);

        return scoreExportService.export(scores, semester); // ✅ truyền semester
    }

    public byte[] exportPdf(Long classId, Integer semester, String email) {
        try {
            Teacher teacher = teacherRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            Clazz clazz = classRepository.findById(classId)
                    .orElseThrow(() -> new RuntimeException("Class not found"));
            Long subjectId = teacher.getSubject().getId();

            List<Score> scores = scoreRepository.findByStudent_StudentClass_Id(classId)
                    .stream()
                    .filter(s -> s.getSemester() == semester)
                    .filter(s -> s.getSubject().getId().equals(subjectId)) // 🔥 FIX
                    .toList();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4, 40, 40, 40, 40);
            PdfWriter.getInstance(doc, out);

            doc.open();

            Font bold = new Font(Font.HELVETICA, 12, Font.BOLD);
            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);

            // ===== HEADER =====
            doc.add(new Paragraph("TRƯỜNG THPT NGUYỄN TRÃI", bold));

            Paragraph title = new Paragraph("BẢNG ĐIỂM LỚP", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);

            doc.add(new Paragraph("Giáo viên: " + teacher.getFullName(), bold));
            doc.add(new Paragraph("Lớp: " + clazz.getName(), bold));
            doc.add(new Paragraph("Môn: " + teacher.getSubject().getName(), bold));

            Paragraph sub = new Paragraph("Học kỳ: " + semester);
            sub.setAlignment(Element.ALIGN_CENTER);
            doc.add(sub);

            doc.add(new Paragraph(" "));

            // ===== TABLE =====
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);

            addHeader(table, "STT");
            addHeader(table, "Học sinh");
            addHeader(table, "KTTX");
            addHeader(table, "Giữa kỳ");
            addHeader(table, "Cuối kỳ");
            addHeader(table, "TB");

            int index = 1;

            for (Score s : scores) {

                Double oral = semester == 1 ? s.getOral1() : s.getOral2();
                Double test = semester == 1 ? s.getTest15_1() : s.getTest15_2();
                double mid = semester == 1 ? safe(s.getMid1()) : safe(s.getMid2());
                double fin = semester == 1 ? safe(s.getFinal1()) : safe(s.getFinal2());

                if ((oral == null || oral == 0) &&
                        (test == null || test == 0) &&
                        mid == 0 && fin == 0)
                    continue;

                double sum = 0;
                int count = 0;

                if (oral != null) {
                    sum += oral;
                    count++;
                }
                if (test != null) {
                    sum += test;
                    count++;
                }

                double kttx = count > 0 ? sum / count : 0;

                double avg = (kttx + mid + fin) / 3;

                table.addCell(center(String.valueOf(index++)));
                table.addCell(s.getStudent().getFullName());
                table.addCell(center(format(kttx)));
                table.addCell(center(format(mid)));
                table.addCell(center(format(fin)));
                table.addCell(center(format(avg)));
            }

            doc.add(table);

            doc.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("PDF_ERROR");
        }
    }

    public byte[] exportPdfByStudent(Long studentId, Integer semester) {
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            List<Score> scores = scoreRepository.findByStudent(student);

            // 🔥 loại trùng môn
            Map<String, Score> map = new LinkedHashMap<>();
            for (Score s : scores) {
                map.put(s.getSubject().getName(), s);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4, 40, 40, 40, 40);
            PdfWriter.getInstance(doc, out);

            doc.open();

            // ===== FONT =====
            Font normal = new Font(Font.HELVETICA, 11);
            Font bold = new Font(Font.HELVETICA, 12, Font.BOLD);
            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);

            // ===== HEADER =====
            Paragraph school = new Paragraph("TRƯỜNG THPT NGUYỄN TRÃI", bold);
            doc.add(school);

            Paragraph title = new Paragraph("KẾT QUẢ HỌC TẬP", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);

            Paragraph sub = new Paragraph(
                    "Học kỳ: " + semester + "    Năm học: 2026 - 2027",
                    normal);
            sub.setAlignment(Element.ALIGN_CENTER);
            doc.add(sub);

            doc.add(new Paragraph(" "));

            // ===== INFO =====
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);

            infoTable.addCell(noBorder("Họ và tên: " + student.getFullName()));
            infoTable.addCell(noBorder(""));
            String className = student.getStudentClass() != null
                    ? student.getStudentClass().getName()
                    : "N/A";

            infoTable.addCell(noBorder("Lớp: " + className));
            infoTable.addCell(noBorder(""));

            doc.add(infoTable);
            doc.add(new Paragraph(" "));

            // ===== TABLE =====
            PdfPTable table = createTable();

            int index = 1;
            double totalAvg = 0;
            double minSubject = 10;
            int count = 0;

            for (Score s : map.values()) {

                // ✅ lấy theo học kỳ
                double oral = semester == 1 ? safe(s.getOral1()) : safe(s.getOral2());
                double test = semester == 1 ? safe(s.getTest15_1()) : safe(s.getTest15_2());
                double mid = semester == 1 ? safe(s.getMid1()) : safe(s.getMid2());
                double fin = semester == 1 ? safe(s.getFinal1()) : safe(s.getFinal2());

                double kttx = (oral + test) / 2;
                double avg = (kttx + mid * 2 + fin * 3) / 6;

                // 👉 tính KQHT
                totalAvg += avg;
                count++;
                if (avg < minSubject) {
                    minSubject = avg;
                }

                // 👉 add row
                table.addCell(center(String.valueOf(index++)));
                table.addCell(s.getSubject().getName());
                table.addCell(center(format(kttx)));
                table.addCell(center(format(mid)));
                table.addCell(center(format(fin)));
                table.addCell(center(format(avg)));
            }

            doc.add(table);

            // ===== KQHT =====
            double finalAvg = totalAvg / count;
            String kqht = classify(finalAvg, minSubject);

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph(
                    "KQHT: " + kqht + " (TB: " + format(finalAvg) + ")",
                    bold));

            doc.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("PDF_ERROR");
        }
    }

    private PdfPTable createTable() {
        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);

        addHeader(table, "TT");
        addHeader(table, "Môn học");
        addHeader(table, "KTTX");
        addHeader(table, "Giữa kỳ");
        addHeader(table, "Cuối kỳ");
        addHeader(table, "TB");

        return table;
    }

    private String classify(double avg, double min) {
        if (avg >= 8.0 && min >= 6.5)
            return "Giỏi";
        if (avg >= 6.5 && min >= 5.0)
            return "Khá";
        if (avg >= 5.0 && min >= 3.5)
            return "Trung bình";
        return "Yếu";
    }

    private PdfPCell addHeader(PdfPTable table, String text) {
        Font font = new Font(Font.HELVETICA, 11, Font.BOLD);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(new java.awt.Color(220, 220, 220));
        table.addCell(cell);
        return cell;
    }

    private PdfPCell center(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }

    private PdfPCell noBorder(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text));
        cell.setBorder(Rectangle.NO_BORDER);
        return cell;
    }

    private String format(double val) {
        return String.format("%.1f", val);
    }

    public byte[] exportAll(Integer semester) throws IOException {
        List<Score> scores = scoreRepository.findAll();
        return scoreExportService.export(scores, semester);
    }
}
