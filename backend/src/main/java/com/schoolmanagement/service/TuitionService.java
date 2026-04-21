package com.schoolmanagement.service;

import com.schoolmanagement.entity.Clazz;
import com.schoolmanagement.entity.Fund;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.entity.Tuition;
import com.schoolmanagement.repository.ClazzRepository;
import com.schoolmanagement.repository.FundRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.TuitionRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TuitionService {
    private final TuitionRepository tuitionRepository;
    private final StudentRepository studentRepository;
    private final FundRepository fundRepository;
    private final ClazzRepository clazzRepository;

    public TuitionService(TuitionRepository tuitionRepository, StudentRepository studentRepository  , FundRepository fundRepository, ClazzRepository clazzRepository) {
        this.tuitionRepository = tuitionRepository;
        this.studentRepository = studentRepository;
        this.fundRepository = fundRepository;
        this.clazzRepository = clazzRepository;
    }

    public List<Tuition> getAll() {
        return tuitionRepository.findAll();
    }

    public Tuition getById(Long id) {
        return tuitionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Tuition not found"));
    }

    public Tuition create(Tuition tuition, Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        tuition.setStudent(student);
        return tuitionRepository.save(tuition);
    }

    public Tuition update(Long id, String status) {
        Tuition existing = getById(id);

        existing.setStatus(status);
        Tuition saved = tuitionRepository.save(existing);

        // 🔥 nếu PAID → tạo Fund
        if ("PAID".equalsIgnoreCase(status)) {

            Student student = existing.getStudent();
            Clazz clazz = student.getStudentClass();

            Fund fund = new Fund();
            fund.setName("Tuition - " + student.getFullName());
            fund.setAmount(existing.getAmount()); // 900k
            fund.setStatus("PAID");
            fund.setClazz(clazz);

            fundRepository.save(fund);
        }

        return saved;
    }

    public void delete(Long id) {
        tuitionRepository.deleteById(id);
    }
}
