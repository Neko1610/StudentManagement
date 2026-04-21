package com.schoolmanagement.service;

import com.schoolmanagement.entity.Clazz;
import com.schoolmanagement.entity.Fund;
import com.schoolmanagement.repository.ClazzRepository;
import com.schoolmanagement.repository.FundRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FundService {
    private final FundRepository fundRepository;
    private final ClazzRepository clazzRepository;

    public FundService(FundRepository fundRepository, ClazzRepository clazzRepository) {
        this.fundRepository = fundRepository;
        this.clazzRepository = clazzRepository;
    }

    public List<Fund> getAll() {
        return fundRepository.findAll();
    }

    public Fund getById(Long id) {
        return fundRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Fund not found"));
    }

    public Fund create(Fund fund, Long classId) {
        Clazz clazz = clazzRepository.findById(classId).orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        fund.setClazz(clazz);
        return fundRepository.save(fund);
    }

    public Fund update(Long id, Fund updated) {
        Fund existing = getById(id);
        existing.setName(updated.getName());
        existing.setAmount(updated.getAmount());
        existing.setStatus(updated.getStatus());
        return fundRepository.save(existing);
    }

    public void delete(Long id) {
        fundRepository.deleteById(id);
    }
}
