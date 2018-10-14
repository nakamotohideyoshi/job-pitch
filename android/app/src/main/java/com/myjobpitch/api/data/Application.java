package com.myjobpitch.api.data;

import java.util.List;

public class Application extends BaseApplication {

    private Job job_data;
    private JobSeeker job_seeker;
    private Integer created_by;
    private Integer deleted_by;
    private List<Message> messages;
    private List<Pitch> pitches;
    private List<Interview> interviews;

    public Job getJob_data() {
        return job_data;
    }
    public JobSeeker getJob_seeker() {
        return job_seeker;
    }
    public Integer getCreated_by() {
        return created_by;
    }
    public Integer getDeleted_by() {
        return deleted_by;
    }
    public List<Message> getMessages() {
        return messages;
    }
    public List<Pitch> getPitches() {
        return pitches;
    }
    public List<Interview> getInterviews() {
        return interviews;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

}
