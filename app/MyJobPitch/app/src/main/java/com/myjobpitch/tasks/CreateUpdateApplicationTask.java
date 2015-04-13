package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;

public class CreateUpdateApplicationTask extends CreateUpdateAPITask<Application> {
    public CreateUpdateApplicationTask(final MJPApi api, final Application business) {
        super(business, new Action<Application>() {
            @Override
            public Application create(Application business) throws MJPApiException {
                return api.create(Application.class, business);
            }

            @Override
            public Application update(Application business) throws MJPApiException {
                return api.update(Application.class, business);
            }
        });
    }
}