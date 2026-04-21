package com.schoolmanagement.controller;

import com.schoolmanagement.entity.Fund;
import com.schoolmanagement.repository.FundRepository;
import com.schoolmanagement.service.FundService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/funds")
@CrossOrigin(origins = "*")
public class FundController {
    private final FundService fundService;
    private final FundRepository fundRepository;

    public FundController(FundService fundService, FundRepository fundRepository) {
        this.fundService = fundService;
        this.fundRepository = fundRepository;

    }

    @GetMapping
    public ResponseEntity<List<Fund>> getAll() {
        return ResponseEntity.ok(fundService.getAll());
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Fund>> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(
                fundRepository.findByClazz_Id(classId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fund> getById(@PathVariable Long id) {
        return ResponseEntity.ok(fundService.getById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Fund> create(@Valid @RequestBody Fund fund, @RequestParam Long classId) {
        return ResponseEntity.ok(fundService.create(fund, classId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Fund> update(@PathVariable Long id, @Valid @RequestBody Fund fund) {
        return ResponseEntity.ok(fundService.update(id, fund));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        fundService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
