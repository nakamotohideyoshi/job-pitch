/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.myjobpitch.gcm;

import android.app.IntentService;
import android.content.Intent;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.google.android.gms.gcm.GcmPubSub;
import com.google.android.gms.gcm.GoogleCloudMessaging;
import com.google.android.gms.iid.InstanceID;
import com.myjobpitch.R;
import com.myjobpitch.global.UserInfo;

import android.content.ComponentName;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;


import java.io.IOException;
import java.util.Locale;



public class RegistrationIntentService extends IntentService {

    private static final String TAG = "RegIntentService";
    private static final String[] TOPICS = {"global"};

    public RegistrationIntentService() {
        super(TAG);
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);

        try {
            // [START register_for_gcm]
            // Initially this call goes out to the network to retrieve the token, subsequent calls
            // are local.
            // R.string.gcm_defaultSenderId (the Sender ID) is typically derived from google-services.json.
            // See https://developers.google.com/cloud-messaging/android/start for details on this file.
            // [START get_token]
            InstanceID instanceID = InstanceID.getInstance(this);
            String token = instanceID.getToken(getString(R.string.gcm_sender_id),
                    GoogleCloudMessaging.INSTANCE_ID_SCOPE, null);
            // [END get_token]
            Log.i(TAG, "GCM Registration Token: " + token);

            // TODO: Implement this method to send any registration to your app's servers.

            UserInfo.setDeviceToken(token);

            // Subscribe to topic channels
            subscribeTopics(token);

            // You should store a boolean that indicates whether the generated token has been
            // sent to your server. If the boolean is false, send the token to your server,
            // otherwise your server should have already received the token.
            sharedPreferences.edit().putBoolean(UserInfo.KEY_SENT_TOKEN_TO_SERVER, true).apply();
            // [END register_for_gcm]

        } catch (Exception e) {
            Log.d(TAG, "Failed to complete token refresh", e);
            // If an exception happens while fetching the new token or updating our registration data
            // on a third-party server, this ensures that we'll attempt the update at a later time.
            sharedPreferences.edit().putBoolean(UserInfo.KEY_SENT_TOKEN_TO_SERVER, false).apply();
        }

        // Notify UI that registration has completed, so the progress indicator can be hidden.
        Intent registrationComplete = new Intent(UserInfo.KEY_REGISTRATION_COMPLETE);
        LocalBroadcastManager.getInstance(this).sendBroadcast(registrationComplete);

        checkNotificatioService(intent);
    }



    public void checkNotificatioService(Intent intent)
    {
        Log.d("CHECK", "NotificationService");

        // The manufacturer of the product/hardware.

        String manufactureStr = Build.MANUFACTURER;

        Log.d("CHECK", "manufacture : " + manufactureStr);

        //SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
        //sharedPreferences.edit().putBoolean(UserInfo.KEY_SENT_TOKEN_TO_SERVER, true).apply();


        int badgeno = UserInfo.getNotificationCount(this); //1;//new Random().nextInt(100);

        if (manufactureStr != null) {

            boolean bool2 = manufactureStr.toLowerCase(Locale.US).contains("htc");
            boolean bool3 = manufactureStr.toLowerCase(Locale.US).contains("sony");
            boolean bool4 = manufactureStr.toLowerCase(Locale.US).contains("samsung");

            // Sony Ericssion
            if (bool3) {
                try {
                    intent.setAction("com.sonyericsson.home.action.UPDATE_BADGE");
                    intent.putExtra("com.sonyericsson.home.intent.extra.badge.ACTIVITY_NAME", "MainActivity");
                    intent.putExtra("com.sonyericsson.home.intent.extra.badge.SHOW_MESSAGE", true);
                    intent.putExtra("com.sonyericsson.home.intent.extra.badge.MESSAGE", badgeno);
                    intent.putExtra("com.sonyericsson.home.intent.extra.badge.PACKAGE_NAME", "princess.sofia.bubblegiga");

                    sendBroadcast(intent);
                } catch (Exception localException) {
                    Log.e("CHECK", "Sony : " + localException.getLocalizedMessage());
                }
            }

            // HTC
            if (bool2) {
                try {
                    Intent localIntent1 = new Intent("com.htc.launcher.action.UPDATE_SHORTCUT");
                    localIntent1.putExtra("packagename", "princess.sofia.bubblegiga");
                    localIntent1.putExtra("count", badgeno);
                    sendBroadcast(localIntent1);

                    Intent localIntent2 = new Intent("com.htc.launcher.action.SET_NOTIFICATION");
                    ComponentName localComponentName = new ComponentName(this, "MainActivity");
                    localIntent2.putExtra("com.htc.launcher.extra.COMPONENT", localComponentName.flattenToShortString());
                    localIntent2.putExtra("com.htc.launcher.extra.COUNT", 10);
                    sendBroadcast(localIntent2);
                } catch (Exception localException) {
                    Log.e("CHECK", "HTC : " + localException.getLocalizedMessage());
                }
            }
            if (bool4) {
                // Samsung
                try {
                    ContentResolver localContentResolver = getContentResolver();
                    Uri localUri = Uri.parse("content://com.sec.badge/apps");
                    ContentValues localContentValues = new ContentValues();
                    localContentValues.put("package", "princess.sofia.bubblegiga");
                    localContentValues.put("class", "MainActivity");
                    localContentValues.put("badgecount", Integer.valueOf(badgeno));
                    String str = "package=? AND class=?";
                    String[] arrayOfString = new String[2];
                    arrayOfString[0] = "princess.sofia.bubblegiga";
                    arrayOfString[1] = "MainActivity";

                    int update = localContentResolver.update(localUri, localContentValues, str, arrayOfString);

                    if (update == 0) {
                        localContentResolver.insert(localUri, localContentValues);
                    }

                } catch (IllegalArgumentException localIllegalArgumentException) {
                    Log.e("CHECK", "Samsung1F : " + localIllegalArgumentException.getLocalizedMessage());
                } catch (Exception localException) {
                    Log.e("CHECK", "Samsung : " + localException.getLocalizedMessage());
                }
            }
        }
    }

    /**
     * Subscribe to any GCM topics of interest, as defined by the TOPICS constant.
     *
     * @param token GCM token
     * @throws IOException if unable to reach the GCM PubSub service
     */
    // [START subscribe_topics]
    private void subscribeTopics(String token) throws IOException {
        GcmPubSub pubSub = GcmPubSub.getInstance(this);
        for (String topic : TOPICS) {
            pubSub.subscribe(token, "/topics/" + topic, null);
        }
    }
    // [END subscribe_topics]

}
