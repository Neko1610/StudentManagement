package com.schoolmanagement.service;

import com.schoolmanagement.entity.Score;
import com.schoolmanagement.entity.Teacher;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ScoreExportService {

    // ===== KTTX = trung bình Oral + 15p =====
    private double calculateKttx(Score s, int semester) {

        Double oral = semester == 1 ? s.getOral1() : s.getOral2();
        Double test = semester == 1 ? s.getTest15_1() : s.getTest15_2();

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

        return count > 0 ? sum / count : 0;
    }

    // ===== TÍNH TB =====
    private double calculateAvg(Score s, int semester) {

        double kttx = calculateKttx(s, semester);

        double mid = semester == 1
                ? (s.getMid1() != null ? s.getMid1() : 0)
                : (s.getMid2() != null ? s.getMid2() : 0);

        double fin = semester == 1
                ? (s.getFinal1() != null ? s.getFinal1() : 0)
                : (s.getFinal2() != null ? s.getFinal2() : 0);

        return (kttx + 2 * mid + 3 * fin) / 6;
    }

    public byte[] export(List<Score> scores, int semester) throws IOException {

        try (XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Scores");
            int rowIndex = 0;

            // Lấy student đầu tiên
            Score first = scores.get(0);

            String studentName = first.getStudent().getFullName();
            String studentCode = first.getStudent().getStudentCode();
            String className = first.getStudent().getStudentClass() != null
                    ? first.getStudent().getStudentClass().getName()
                    : "N/A";

            // ===== INFO =====
            Row r1 = sheet.createRow(rowIndex++);
            r1.createCell(0).setCellValue("Học kỳ: " + semester);

            Row r2 = sheet.createRow(rowIndex++);
            r2.createCell(0).setCellValue("Họ tên: " + studentName);

            Row r3 = sheet.createRow(rowIndex++);
            r3.createCell(0).setCellValue("Lớp: " + className);

            // cách 1 dòng cho đẹp
            rowIndex++;
            // ===== HEADER =====
            Row header = sheet.createRow(rowIndex++);
            header.createCell(0).setCellValue("Student Code");
            header.createCell(1).setCellValue("Student Name");
            header.createCell(2).setCellValue("Subject");
            header.createCell(3).setCellValue("KTTX");
            header.createCell(4).setCellValue("Mid");
            header.createCell(5).setCellValue("Final");
            header.createCell(6).setCellValue("Average");

            // ===== LOẠI TRÙNG MÔN =====
            Map<String, Score> map = new LinkedHashMap<>();
            for (Score s : scores) {
                map.put(s.getSubject().getName(), s);
            }

            for (Score s : map.values()) {

                double oral = semester == 1
                        ? (s.getOral1() != null ? s.getOral1() : 0)
                        : (s.getOral2() != null ? s.getOral2() : 0);

                double test = semester == 1
                        ? (s.getTest15_1() != null ? s.getTest15_1() : 0)
                        : (s.getTest15_2() != null ? s.getTest15_2() : 0);

                double mid = semester == 1
                        ? (s.getMid1() != null ? s.getMid1() : 0)
                        : (s.getMid2() != null ? s.getMid2() : 0);

                double fin = semester == 1
                        ? (s.getFinal1() != null ? s.getFinal1() : 0)
                        : (s.getFinal2() != null ? s.getFinal2() : 0);

                // ❌ BỎ DÒNG RỖNG
                if (oral == 0 && test == 0 && mid == 0 && fin == 0)
                    continue;

                Row row = sheet.createRow(rowIndex++);

                row.createCell(0).setCellValue(s.getStudent().getStudentCode());
                row.createCell(1).setCellValue(s.getStudent().getFullName());
                row.createCell(2).setCellValue(s.getSubject().getName());

                double kttx = calculateKttx(s, semester);

                row.createCell(3).setCellValue(round(kttx));
                row.createCell(4).setCellValue(round(mid));
                row.createCell(5).setCellValue(round(fin));

                double avg = calculateAvg(s, semester);
                row.createCell(6).setCellValue(round(avg));
            }

            // ===== AUTO SIZE =====
            for (int i = 0; i < 7; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    public byte[] exportTeacher(List<Score> scores, int semester, Teacher teacher) throws IOException {

        try (XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Teacher Scores");

            int rowIndex = 0;

            // ===== SAFE CHECK =====
            if (scores == null || scores.isEmpty()) {
                // tạo file rỗng nhưng không crash
                Row r = sheet.createRow(0);
                r.createCell(0).setCellValue("Không có dữ liệu");
                workbook.write(outputStream);
                return outputStream.toByteArray();
            }

            Score first = scores.get(0);

            String className = "N/A";
            if (first.getStudent() != null && first.getStudent().getStudentClass() != null) {
                className = first.getStudent().getStudentClass().getName();
            }

            String teacherName = teacher != null ? teacher.getFullName() : "N/A";
            String subjectName = (teacher != null && teacher.getSubject() != null)
                    ? teacher.getSubject().getName()
                    : "N/A";

            // ===== INFO =====
            Row r1 = sheet.createRow(rowIndex++);
            r1.createCell(0).setCellValue("Học kỳ: " + semester);

            Row r2 = sheet.createRow(rowIndex++);
            r2.createCell(0).setCellValue("Giáo viên: " + teacherName);

            Row r3 = sheet.createRow(rowIndex++);
            r3.createCell(0).setCellValue("Môn: " + subjectName);

            Row r4 = sheet.createRow(rowIndex++);
            r4.createCell(0).setCellValue("Lớp: " + className);

            rowIndex++;

            // ===== HEADER =====
            Row header = sheet.createRow(rowIndex++);
            header.createCell(0).setCellValue("Student Code");
            header.createCell(1).setCellValue("Student Name");
            header.createCell(2).setCellValue("KTTX");
            header.createCell(3).setCellValue("Mid");
            header.createCell(4).setCellValue("Final");
            header.createCell(5).setCellValue("Average");

            for (Score s : scores) {

                if (s == null || s.getStudent() == null)
                    continue;

                double kttx = calculateKttx(s, semester);
                double mid = semester == 1 ? safe(s.getMid1()) : safe(s.getMid2());
                double fin = semester == 1 ? safe(s.getFinal1()) : safe(s.getFinal2());
                double avg = calculateAvg(s, semester);

                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(
                        s.getStudent().getStudentCode() != null ? s.getStudent().getStudentCode() : "");
                row.createCell(1).setCellValue(
                        s.getStudent().getFullName() != null ? s.getStudent().getFullName() : "");
                row.createCell(2).setCellValue(kttx);
                row.createCell(3).setCellValue(mid);
                row.createCell(4).setCellValue(fin);
                row.createCell(5).setCellValue(avg);
            }

            // auto size cho đẹp
            for (int i = 0; i < 6; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private double safe(Double value) {
        return value != null ? value : 0;
    }

    // ===== FORMAT 1 SỐ THẬP PHÂN =====
    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}