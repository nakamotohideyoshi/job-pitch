package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.auth.User;

public class UpdateUserTask extends CreateUpdateAPITask<User> {
    public UpdateUserTask(final MJPApi api, final User user) {
        super(user, new Action<User>() {
            @Override
            public User create(User user) throws MJPApiException {
                throw new RuntimeException("User must have an ID!");
            }

            @Override
            public User update(User user) throws MJPApiException {
                return api.updateUser(user);
            }
        });
    }
}
