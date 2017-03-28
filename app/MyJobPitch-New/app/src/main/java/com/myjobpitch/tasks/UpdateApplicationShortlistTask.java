package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.ApplicationShortlistUpdate;

public class UpdateApplicationShortlistTask extends CreateUpdateAPITask<ApplicationShortlistUpdate> {
    public UpdateApplicationShortlistTask(final ApplicationShortlistUpdate application) {
        super(application, new Action<ApplicationShortlistUpdate>() {
            @Override
            public ApplicationShortlistUpdate create(ApplicationShortlistUpdate application) throws MJPApiException {
                throw new UnsupportedOperationException("application has no id!");
            }

            @Override
            public ApplicationShortlistUpdate update(ApplicationShortlistUpdate application) throws MJPApiException {
                MJPApi.shared().updateApplicationShortlist(application);
                return null;
            }
        });
    }
}
