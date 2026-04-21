package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Schedule;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.entity.Clazz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByTeacher(Teacher teacher);

    List<Schedule> findByClazz(Clazz clazz);

    List<Schedule> findByTeacherAndDayOfWeekAndPeriod(Teacher teacher, Schedule.DayOfWeek dayOfWeek, Integer period);

    List<Schedule> findByClazzAndDayOfWeekAndPeriod(Clazz clazz, Schedule.DayOfWeek dayOfWeek, Integer period);

    List<Schedule> findByClazzId(Long clazzId);

    List<Schedule> findByTeacherId(Long teacherId);

    @Query("""
                SELECT s FROM Schedule s
                JOIN FETCH s.clazz
                JOIN FETCH s.subject
                WHERE s.teacher.id = :teacherId
            """)
    List<Schedule> findFullByTeacherId(Long teacherId);

}
