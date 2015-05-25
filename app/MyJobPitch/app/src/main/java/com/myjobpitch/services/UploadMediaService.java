package com.myjobpitch.services;

import android.app.IntentService;
import android.content.Intent;
import android.content.Context;
import android.support.v4.content.LocalBroadcastManager;

/**
 * An {@link IntentService} subclass for handling asynchronous task requests in
 * a service on a separate handler thread.
 * <p/>
 * helper methods.
 */
public class UploadMediaService extends IntentService {
    private static final String ACTION_UPLOAD_MEDIA = "com.myjobpitch.action.UPLOAD_MEDIA";
    private static final String UPLOAD_MEDIA_COMPLETE = "com.myjobpitch.action.UPLOAD_MEDIA_COMPLETE";

//    private static final String EXTRA_PARAM1 = "com.myjobpitch.extra.PARAM1";
//    private static final String EXTRA_PARAM2 = "com.myjobpitch.extra.PARAM2";

    /**
     * Starts this service to perform action Foo with the given parameters. If
     * the service is already performing a task this action will be queued.
     *
     * @see IntentService
     */
    // TODO: Customize helper method
    public static void startActionUploadMedia(Context context) {
        Intent intent = new Intent(context, UploadMediaService.class);
        intent.setAction(ACTION_UPLOAD_MEDIA);
//        intent.putExtra(EXTRA_PARAM1, param1);
//        intent.putExtra(EXTRA_PARAM2, param2);
        context.startService(intent);
    }

    public UploadMediaService() {
        super("UploadVideoService");
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        if (intent != null) {
            final String action = intent.getAction();
            if (ACTION_UPLOAD_MEDIA.equals(action)) {
//                final String param1 = intent.getStringExtra(EXTRA_PARAM1);
//                final String param2 = intent.getStringExtra(EXTRA_PARAM2);
                handleActionUploadVideo();
            }
        }
    }

    /**
     * Handle action Foo in the provided background thread with the provided
     * parameters.
     */
    private void handleActionUploadVideo() {

        Intent localIntent = new Intent(UPLOAD_MEDIA_COMPLETE);
        LocalBroadcastManager.getInstance(this).sendBroadcast(localIntent);
    }
}
