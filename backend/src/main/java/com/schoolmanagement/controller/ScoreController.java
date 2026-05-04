package com.schoolmanagement.controller;

import com.schoolmanagement.dto.ScoreDTO;
import com.schoolmanagement.entity.Score;
import com.schoolmanagement.service.ScoreService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/scores")
@CrossOrigin(origins = "*")
public class ScoreController {
    private final ScoreService scoreService;

    public ScoreController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    @GetMapping
    public ResponseEntity<List<Score>> getAll() {
        return ResponseEntity.ok(scoreService.getAll());
    }

    @GetMapping("/class/{classId}")
    public List<ScoreDTO> getByClass(
            @PathVariable Long classId,
            @RequestParam String email) {

        return scoreService.getByClassAndTeacher(classId, email);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Score> getById(@PathVariable Long id) {
        return ResponseEntity.ok(scoreService.getById(id));
    }

    @GetMapping("/export/{studentId}")
    public ResponseEntity<byte[]> exportByStudent(@PathVariable Long studentId) throws IOException {

        byte[] file = scoreService.exportByStudent(studentId);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=scores.xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(file);
    }

    @GetMapping("/export/student/{studentId}")
    public ResponseEntity<byte[]> exportByStudentAlias(@PathVariable Long studentId) throws IOException {
        return exportByStudent(studentId);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ScoreDTO>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(scoreService.getByStudentId(studentId));
    }

    @GetMapping("/teacher/student/{studentId}")
    public ResponseEntity<List<ScoreDTO>> getByTeacher(
            @PathVariable Long studentId,
            @RequestParam String email) {

        return ResponseEntity.ok(
                scoreService.getByStudentAndTeacher(studentId, email));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping
    public ResponseEntity<Score> create(@Valid @RequestBody Score score) {
        return ResponseEntity.ok(scoreService.create(score));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<Score> update(
            @PathVariable Long id,
            @Valid @RequestBody Score score,
            @RequestParam Integer semester // 🔥 thêm
    ) {
        return ResponseEntity.ok(scoreService.update(id, score, semester));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        scoreService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> export() throws IOException {
        byte[] content = scoreService.exportAll();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=score-report.xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(content);
    }

    @GetMapping("/export/class/{classId}")
    public ResponseEntity<byte[]> exportByClass(
            @PathVariable Long classId,
            @RequestParam Integer semester) throws IOException {

        byte[] content = scoreService.exportByClass(classId, semester);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=score_class_" + classId + "_hk" + semester + ".xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(content);
    }

    @GetMapping("/export/class/{classId}/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable Long classId,
            @RequestParam Integer semester) {
        byte[] data = scoreService.exportPdf(classId, semester);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=score_class_" + classId + "_hk" + semester + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    @GetMapping("/export/student/{studentId}/pdf")
    public ResponseEntity<byte[]> exportPdfByStudent(
            @PathVariable Long studentId,
            @RequestParam Integer semester 
    ) {
        byte[] data = scoreService.exportPdfByStudent(studentId, semester);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=score_student_" + studentId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
