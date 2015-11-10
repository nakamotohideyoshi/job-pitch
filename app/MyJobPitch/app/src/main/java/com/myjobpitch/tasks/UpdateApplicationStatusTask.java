package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.ApplicationShortlistUpdate;
import com.myjobpitch.api.data.ApplicationStatusUpdate;

public class UpdateApplicationStatusTask extends CreateUpdateAPITask<ApplicationStatusUpdate> {
    public UpdateApplicationStatusTask(final MJPApi api, final ApplicationStatusUpdate application) {
        super(application, new Action<ApplicationStatusUpdate>() {
            @Override
            public ApplicationStatusUpdate create(ApplicationStatusUpdate application) throws MJPApiException {
                throw new UnsupportedOperationException("application has no id!");
            }

            @Override
            public ApplicationStatusUpdate update(ApplicationStatusUpdate application) throws MJPApiException {
                api.updateApplicationStatus(application);
                return null;
            }
        });
    }
}
