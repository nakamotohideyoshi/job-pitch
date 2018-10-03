package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties({"jobSeeker"})
public class Application extends BaseApplication {
    private JobSeeker job_seeker;
    private Job job_data;
    private Integer created_by;
    private Integer deleted_by;
    private List<Message> messages;

    //Added in API V3
    private List<Interview> interviews;
    private List<Pitch> pitches;

    public JobSeeker getJob_seeker() {
        return job_seeker;
    }

    public Integer getCreated_by() {
        return created_by;
    }

    public Integer getDeleted_by() {
        return deleted_by;
    }

    public JobSeeker getJobSeeker() {
        return job_seeker;
    }

    public List<Message> getMessages() {
        return messages;
    }

    public Job getJob_data() {
        return job_data;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public List<Interview> getInterviews() {
        return interviews;
    }

    public List<Pitch> getPitches() {
        return pitches;
    }
}