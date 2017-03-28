package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Pitch;

public class CreatePitchTask extends CreateUpdateAPITask<Pitch> {
    public CreatePitchTask(final Pitch pitch) {
        super(pitch, new Action<Pitch>() {
            @Override
            public Pitch create(Pitch pitch) throws MJPApiException {
                return MJPApi.shared().create(Pitch.class, pitch);
            }

            @Override
            public Pitch update(Pitch message) throws MJPApiException {
                throw new UnsupportedOperationException("can't update a pitch");
            }
        });
    }
}