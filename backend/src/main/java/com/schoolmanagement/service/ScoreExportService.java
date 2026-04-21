package com.schoolmanagement.service;

import com.schoolmanagement.entity.Score;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ScoreExportService {
    private double calculateAvg(Score s) {

        double oral1 = s.getOral1() != null ? s.getOral1() : 0;
        double test15 = s.getTest15_1() != null ? s.getTest15_1() : 0;

        double mid = s.getMid1() != null ? s.getMid1() : 0;
        double fin = s.getFinal1() != null ? s.getFinal1() : 0;

        int countTX = 0;
        double sumTX = 0;

        if (s.getOral1() != null) {
            sumTX += oral1;
            countTX++;
        }

        if (s.getTest15_1() != null) {
            sumTX += test15;
            countTX++;
        }

        if (countTX == 0)
            return 0;

        return (sumTX + 2 * mid + 3 * fin) / (countTX + 5);
    }

    public byte[] export(List<Score> scores) throws IOException {

        try (XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Scores");

            // 🔥 HEADER
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Student Code");
            header.createCell(1).setCellValue("Student Name");
            header.createCell(2).setCellValue("Subject");
            header.createCell(3).setCellValue("Oral 1");
            header.createCell(4).setCellValue("15min 1");
            header.createCell(5).setCellValue("Mid 1");
            header.createCell(6).setCellValue("Final 1");
            header.createCell(7).setCellValue("Average");

            // 🔥 DATA
            for (int i = 0; i < scores.size(); i++) {
                Score s = scores.get(i);
                Row row = sheet.createRow(i + 1);

                row.createCell(0).setCellValue(s.getStudent().getStudentCode());
                row.createCell(1).setCellValue(s.getStudent().getFullName());
                row.createCell(2).setCellValue(s.getSubject().getName());

                row.createCell(3).setCellValue(s.getOral1() != null ? s.getOral1() : 0);
                row.createCell(4).setCellValue(s.getTest15_1() != null ? s.getTest15_1() : 0);
                row.createCell(5).setCellValue(s.getMid1() != null ? s.getMid1() : 0);
                row.createCell(6).setCellValue(s.getFinal1() != null ? s.getFinal1() : 0);

                // 🔥 average (nếu bạn đã có getAverage)
                double avg = calculateAvg(s);
                row.createCell(7).setCellValue(avg);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}