package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.MessageForUpdate;

public class UpdateMessageTask extends CreateUpdateAPITask<MessageForUpdate> {
    public UpdateMessageTask(final MessageForUpdate message) {
        super(message, new Action<MessageForUpdate>() {
            @Override
            public MessageForUpdate create(MessageForUpdate message) throws MJPApiException {
                throw new UnsupportedOperationException("can't create an existing message");
            }

            @Override
            public MessageForUpdate update(MessageForUpdate application) throws MJPApiException {
                return MJPApi.shared().update(MessageForUpdate.class, message);
            }
        });
    }
}