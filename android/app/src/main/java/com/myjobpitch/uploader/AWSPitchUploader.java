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
import com.myjobpitch.api.data.Pitch;

import java.io.File;
import java.util.List;

public class AWSPitchUploader implements PitchUploader {

    private final Context applicationContext;
    private final TransferUtility transferUtility;
    private final String endpoint;

    public AWSPitchUploader(Context applicationContext, String endpoint) {
        this.applicationContext = applicationContext;
        this.endpoint = endpoint;
        CognitoCachingCredentialsProvider credentialsProvider = new CognitoCachingCredentialsProvider(
                applicationContext,
                "eu-west-1:93ae6986-5938-4130-a3c0-f96c39d75be2", // Identity Pool ID
                Regions.EU_WEST_1 // Region
        );
        AmazonS3 s3 = new AmazonS3Client(credentialsProvider);
        transferUtility = new TransferUtility(s3, applicationContext);
    }

    @Override
    public PitchUpload upload(File file, Pitch pitch) {
        return new AWSPitchUpload(transferUtility, file, pitch, endpoint);
    }

    @Override
    public void getUploadInProgress(List<Pitch> pitches, final UploadInProgressCallback callback) {
        for (Pitch pitch : pitches)
            if (pitch.getVideo() == null) {
                for (TransferObserver transfer : transferUtility.getTransfersWithType(TransferType.UPLOAD)) {
                    TransferState state = transfer.getState();
                    if (state.equals(TransferState.COMPLETED) || state.equals(TransferState.CANCELED) || state.equals(TransferState.FAILED)) {
                        transferUtility.deleteTransferRecord(transfer.getId());
                    } else {
                        callback.uploadInProgress(new AWSPitchUploadOngoing(pitch, endpoint, transferUtility, transfer));
                        return;
                    }
                }
                callback.uploadInProgress(new AWSPitchUploadProcessing(pitch, endpoint));
            }
        callback.noUploadInProgress();
    }
}
