package com.schoolmanagement.service;

import com.schoolmanagement.dto.ScoreDTO;
import com.schoolmanagement.entity.Score;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.repository.ScoreRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ScoreService {
    private final ScoreRepository scoreRepository;
    private final StudentRepository studentRepository;
    private final ScoreExportService scoreExportService;

    public ScoreService(ScoreRepository scoreRepository, StudentRepository studentRepository,
            ScoreExportService scoreExportService) {
        this.scoreRepository = scoreRepository;
        this.studentRepository = studentRepository;
        this.scoreExportService = scoreExportService;

    }

    public List<Score> getAll() {
        return scoreRepository.findAll();
    }

    public List<Score> getByClassId(Long classId) {
        return scoreRepository.findByStudent_StudentClass_Id(classId);
    }

    public List<ScoreDTO> getByStudentId(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        List<Score> list = scoreRepository.findByStudent(student);

        return list.stream().map(s -> {
            ScoreDTO dto = new ScoreDTO();

            dto.setId(s.getId());
            dto.setSubjectName(s.getSubject().getName());

            // map điểm
            dto.setAssignmentScore(s.getTest15_1()); // hoặc logic của bạn
            dto.setMidtermScore(s.getMid1());
            dto.setFinalScore(s.getFinal1());

            // tính average (nếu chưa có)
            double avg = ((s.getTest15_1() != null ? s.getTest15_1() : 0) +
                    (s.getMid1() != null ? s.getMid1() : 0) * 2 +
                    (s.getFinal1() != null ? s.getFinal1() : 0) * 3) / 6;

            dto.setAverageScore(avg);

            return dto;
        }).toList();
    }

    public Score getById(Long id) {
        return scoreRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Score not found"));
    }

    public Score create(Score score) {
        return scoreRepository.save(score);
    }

    public Score update(Long id, Score updated) {
        Score current = getById(id);
        current.setOral1(updated.getOral1());
        current.setTest15_1(updated.getTest15_1());
        current.setMid1(updated.getMid1());
        current.setFinal1(updated.getFinal1());
        current.setOral2(updated.getOral2());
        current.setTest15_2(updated.getTest15_2());
        current.setMid2(updated.getMid2());
        current.setFinal2(updated.getFinal2());
        return scoreRepository.save(current);
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

    public byte[] exportByClass(Long classId) throws IOException {

        List<Score> scores = scoreRepository.findByStudent_StudentClass_Id(classId);

        return scoreExportService.export(scores);
    }

    public byte[] exportAll() throws IOException {
        List<Score> scores = scoreRepository.findAll();
        return scoreExportService.export(scores);
    }
}
