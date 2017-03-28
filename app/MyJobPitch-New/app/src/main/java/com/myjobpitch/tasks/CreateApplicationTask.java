package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.ApplicationForCreation;

public class CreateApplicationTask extends CreateUpdateAPITask<ApplicationForCreation> {
    public CreateApplicationTask(final ApplicationForCreation application) {
        super(application, new Action<ApplicationForCreation>() {
            @Override
            public ApplicationForCreation create(ApplicationForCreation application) throws MJPApiException {
                return MJPApi.shared().create(ApplicationForCreation.class, application);
            }

            @Override
            public ApplicationForCreation update(ApplicationForCreation application) throws MJPApiException {
                throw new UnsupportedOperationException("application already has an id!");
            }
        });
    }
}
