package com.myjobpitch.api.data;

public class Application extends BaseApplication implements JobSeekerContainer {
    JobSeeker job_seeker;
    Integer created_by;
    Integer deleted_by;

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
}
