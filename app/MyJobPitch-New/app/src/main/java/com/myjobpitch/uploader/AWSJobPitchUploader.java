package com.myjobpitch.uploader;

import android.content.Context;

import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferObserver;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferState;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferType;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferUtility;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.myjobpitch.api.data.JobPitch;

import java.io.File;
import java.util.List;

public class AWSJobPitchUploader implements JobPitchUploader {

    private final Context applicationContext;
    private final TransferUtility transferUtility;

    public AWSJobPitchUploader(Context applicationContext) {
        this.applicationContext = applicationContext;
        CognitoCachingCredentialsProvider credentialsProvider = new CognitoCachingCredentialsProvider(
                applicationContext,
                "eu-west-1:93ae6986-5938-4130-a3c0-f96c39d75be2", // Identity Pool ID
                Regions.EU_WEST_1 // Region
        );
        AmazonS3 s3 = new AmazonS3Client(credentialsProvider);
        transferUtility = new TransferUtility(s3, applicationContext);
    }

    @Override
    public PitchUpload upload(File file, int job) {
        return new AWSJobPitchUpload(transferUtility, file, job);
    }

    @Override
    public void getUploadInProgress(List<JobPitch> pitches, final UploadInProgressCallback callback) {
        for (JobPitch pitch : pitches)
            if (pitch.getVideo() == null) {
                for (TransferObserver transfer : transferUtility.getTransfersWithType(TransferType.UPLOAD)) {
                    TransferState state = transfer.getState();
                    if (state.equals(TransferState.COMPLETED) || state.equals(TransferState.CANCELED) || state.equals(TransferState.FAILED)) {
                        transferUtility.deleteTransferRecord(transfer.getId());
                    } else {
                        callback.uploadInProgress(new AWSJobPitchUploadOngoing(pitch, transferUtility, transfer));
                        return;
                    }
                }
                callback.uploadInProgress(new AWSJobPitchUploadProcessing(pitch));
            }
        callback.noUploadInProgress();
    }
}
