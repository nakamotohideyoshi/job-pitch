package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.ApplicationUpdate;

public class UpdateApplicationTask extends CreateUpdateAPITask<ApplicationUpdate> {
    public UpdateApplicationTask(final MJPApi api, final ApplicationUpdate application) {
        super(application, new Action<ApplicationUpdate>() {
            @Override
            public ApplicationUpdate create(ApplicationUpdate application) throws MJPApiException {
                throw new UnsupportedOperationException("application has no id!");
            }

            @Override
            public ApplicationUpdate update(ApplicationUpdate application) throws MJPApiException {
                api.updateApplication(application);
                return null;
            }
        });
    }
}
