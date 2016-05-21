package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.tasks.CreateUpdateAPITask;

public class CreateUpdateBusinessTask extends CreateUpdateAPITask<Business> {
    public CreateUpdateBusinessTask(final MJPApi api, final Business business) {
        super(business, new CreateUpdateAPITask.Action<Business>() {
            @Override
            public Business create(Business business) throws MJPApiException {
                return api.createBusiness(business);
            }

            @Override
            public Business update(Business business) throws MJPApiException {
                return api.updateBusiness(business);
            }
        });
    }
}