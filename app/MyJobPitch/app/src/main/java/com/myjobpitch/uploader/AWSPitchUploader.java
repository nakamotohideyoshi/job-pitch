package com.myjobpitch.uploader;

import android.content.Context;

import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferObserver;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferType;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferUtility;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Pitch;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.ReadAPITask;

import java.io.File;
import java.util.List;

/**
 * Created by jcockburn on 11/09/15.
 */
public class AWSPitchUploader implements PitchUploader {

    private final Context applicationContext;
    private final MJPApi api;
    private final TransferUtility transferUtility;

    public AWSPitchUploader(Context applicationContext, MJPApi api) {
        this.applicationContext = applicationContext;
        this.api = api;
        CognitoCachingCredentialsProvider credentialsProvider = new CognitoCachingCredentialsProvider(
                applicationContext,
                "eu-west-1:93ae6986-5938-4130-a3c0-f96c39d75be2", // Identity Pool ID
                Regions.EU_WEST_1 // Region
        );
        AmazonS3 s3 = new AmazonS3Client(credentialsProvider);
        transferUtility = new TransferUtility(s3, applicationContext);
    }

    @Override
    public PitchUpload upload(File file) {
        return new AWSPitchUpload(transferUtility, api, file);
    }

    @Override
    public void getUploadInProgress(final UploadInProgressCallback callback) {
        ReadAPITask<List<Pitch>> getPitchData = new ReadAPITask<List<Pitch>>(new ReadAPITask.Action<List<Pitch>>() {
            @Override
            public List<Pitch> run() throws MJPApiException {
                return api.get(Pitch.class);
            }
        });
        getPitchData.addListener(new CreateReadUpdateAPITaskListener<List<Pitch>>() {
            @Override
            public void onSuccess(List<Pitch> pitches) {
                for (Pitch pitch : pitches)
                    if (pitch.getVideo() == null) {
                        List<TransferObserver> transfers = transferUtility.getTransfersWithType(TransferType.UPLOAD);
                        if (transfers.isEmpty())
                            callback.uploadInProgress(new AWSPitchUploadProcessing(api, pitch));
                        else {
                            TransferObserver transferObserver = transfers.get(0);
                            callback.uploadInProgress(new AWSPitchUploadOngoing(api, pitch, transferObserver));
                        }
                        return;
                    }
                callback.noUploadInProgress();
            }

            @Override
            public void onError(JsonNode errors) {
                callback.error();
            }

            @Override
            public void onConnectionError() {
                callback.error();
            }

            @Override
            public void onCancelled() {}
        });
        getPitchData.execute();
    }
}
