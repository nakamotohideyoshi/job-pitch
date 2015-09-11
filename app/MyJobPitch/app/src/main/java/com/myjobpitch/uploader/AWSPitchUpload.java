package com.myjobpitch.uploader;

import com.amazonaws.mobileconnectors.s3.transferutility.TransferObserver;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferUtility;
import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Pitch;
import com.myjobpitch.tasks.CreatePitchTask;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;

import java.io.File;

/**
 * Created by jcockburn on 11/09/15.
 */
public class AWSPitchUpload extends AWSPitchUploadBase {
    private final File file;
    private final TransferUtility transferUtility;

    public AWSPitchUpload(TransferUtility transferUtility, MJPApi api, File file) {
        super(api, null);
        this.transferUtility = transferUtility;
        this.file = file;
    }

    @Override
    public void start() {
        synchronized (this) {
            listener.onStateChange(PitchUpload.STARTING);
        }
        CreatePitchTask task = new CreatePitchTask(api, new Pitch());
        task.addListener(new CreateReadUpdateAPITaskListener<Pitch>() {
            @Override
            public void onSuccess(Pitch newPitch) {
                pitch = newPitch;
                TransferObserver observer = transferUtility.upload(
                        "mjp-android-uploads",
                        String.format("%s/%s.%s.%s", api.getApiRoot().replace("/", ""), pitch.getToken(), pitch.getId(), file.getName()),
                        file
                );
                synchronized (this) {
                    observer.setTransferListener(AWSPitchUpload.this);
                    listener.onStateChange(PitchUpload.UPLOADING);
                }
            }

            @Override
            public synchronized void onError(JsonNode errors) {
                listener.onError(errors.asText());
            }

            @Override
            public synchronized void onConnectionError() {
                listener.onError("Connection Error");
            }

            @Override
            public void onCancelled() {}
        });
        task.execute();
    }
}
