package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.MessageForCreation;

public class CreateMessageTask extends CreateUpdateAPITask<MessageForCreation> {
    public CreateMessageTask(final MessageForCreation message) {
        super(message, new Action<MessageForCreation>() {
            @Override
            public MessageForCreation create(MessageForCreation message) throws MJPApiException {
                return MJPApi.shared().create(MessageForCreation.class, message);
            }

            @Override
            public MessageForCreation update(MessageForCreation message) throws MJPApiException {
                throw new UnsupportedOperationException("can't update a sent message");
            }
        });
    }
}