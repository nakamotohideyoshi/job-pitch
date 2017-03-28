package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.ApplicationStatusUpdate;

public class UpdateApplicationStatusTask extends CreateUpdateAPITask<ApplicationStatusUpdate> {
    public UpdateApplicationStatusTask(final ApplicationStatusUpdate application) {
        super(application, new Action<ApplicationStatusUpdate>() {
            @Override
            public ApplicationStatusUpdate create(ApplicationStatusUpdate application) throws MJPApiException {
                throw new UnsupportedOperationException("application has no id!");
            }

            @Override
            public ApplicationStatusUpdate update(ApplicationStatusUpdate application) throws MJPApiException {
                MJPApi.shared().updateApplicationStatus(application);
                return null;
            }
        });
    }
}
