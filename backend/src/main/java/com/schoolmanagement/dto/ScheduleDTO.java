package com.schoolmanagement.dto;

public class ScheduleDTO {
    private Long id;
    private String className;
    private String subjectName;
    private String room;
    private String dayOfWeek;
    private Integer period;

    public ScheduleDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public Integer getPeriod() { return period; }
    public void setPeriod(Integer period) { this.period = period; }
}