package com.myjobpitch.api.data;

import java.util.List;

public class Application extends BaseApplication implements JobSeekerContainer {
    private JobSeeker job_seeker;
    private Integer created_by;
    private Integer deleted_by;
    private List<Message> messages;

    public JobSeeker getJob_seeker() {
        return job_seeker;
    }

    public Integer getCreated_by() {
        return created_by;
    }

    public Integer getDeleted_by() {
        return deleted_by;
    }

    @Override
    public JobSeeker getJobSeeker() {
        return job_seeker;
    }

    public List<Message> getMessages() {
        return messages;
    }
}
