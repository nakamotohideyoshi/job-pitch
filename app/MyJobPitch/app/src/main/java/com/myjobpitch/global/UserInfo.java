package com.myjobpitch.global;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;




public class UserInfo {

    public static final String LOG_USER_INFO = "log_user_info";

    public static final String KEY_SENT_TOKEN_TO_SERVER = "key_sentTokenToServer";
    public static final String KEY_REGISTRATION_COMPLETE = "key_registrationComplete";
    public static final String KEY_CURRENT_FB_USER = "key_current_fb_user";
    public static final String KEY_USER_EMAIL = "key_user_email";
    public static final String KEY_DEVICE_TOKEN = "key_device_token";

    public static final String TAG_NOTIFICATION_COUNT = "tag_notification_count";
    public static final String TAG_USER_INFO = "tag_user_info";

    private static String g_email = "";
    private static String g_deviceToken = "";
    private static boolean g_bUserInfoUpdated = false;
    private static JSONObject g_currentFBUser = null;

    private static JSONArray g_friends;
    private static JSONArray g_invitableFriends;
    private static JSONArray g_userScores;

    private static boolean g_bLoggedIn = false;
    private static boolean g_bSynchronizing = false;


    public synchronized static void setCurrentFBUser(JSONObject currentFBUser){

        if(g_currentFBUser != null)
        {
            if(g_currentFBUser.equals(currentFBUser) == false)
            {
                setUserInfoUpdated(true);
            }
        }
        else
        {
            if(currentFBUser != null)
            {
                setUserInfoUpdated(true);
            }

        }

        g_currentFBUser = currentFBUser;
    }

    public synchronized static JSONObject getCurrentFBUser()
    {
        return g_currentFBUser;
    }

    public synchronized static String getFBUserId()
    {
        if(g_currentFBUser != null)
        {
            return g_currentFBUser.optString("id");
        }
        return null;
    }

    public synchronized static String getEmail()
    {
        return g_email;
    }

    public synchronized static void setEmail(String email)
    {
        if(g_email != null)
        {
            if(g_email.equals(email) == false)
            {
                setUserInfoUpdated(true);
            }
        }
        else
        {
            setUserInfoUpdated(true);
        }
        g_email = email;
    }

    public synchronized static String getDeviceToken()
    {
        return g_deviceToken;
    }

    public synchronized static void setDeviceToken(String deviceToken)
    {
        if(g_deviceToken != null)
        {
            if(g_deviceToken.equals(deviceToken) == false)
            {
                setUserInfoUpdated(true);
            }
        }
        else
        {
            if(deviceToken != null)
            {
                setUserInfoUpdated(true);
            }
        }

        g_deviceToken = deviceToken;
    }

    public synchronized static void setUserInfoUpdated(boolean bUserInfoUpdated)
    {
        g_bUserInfoUpdated = bUserInfoUpdated;
    }

    public synchronized static boolean isUserInfoUpdated()
    {
        return g_bUserInfoUpdated;
    }


    public static void saveNotification(Context context, String from, Bundle data)
    {
        String message = data.getString("message");
        String senderId = data.getString("sender_id");
        String message_id = data.getString("message_id");

        int nCount = getNotificationCount(context);

        SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context);
        sharedPreferences.edit().putInt(UserInfo.TAG_NOTIFICATION_COUNT, nCount + 1).apply();

    }

    public static int getNotificationCount(Context context)
    {
        SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context);
        int nCount = sharedPreferences.getInt(UserInfo.TAG_NOTIFICATION_COUNT, 0);
        return nCount;
    }


    public synchronized static void setInvitableFriends(JSONArray invitableFriends)
    {
        g_invitableFriends = invitableFriends;
    }

    public synchronized static JSONArray getInvitableFriends()
    {
        return g_invitableFriends;
    }

    public synchronized static void setFriends(JSONArray friends){
        g_friends = friends;
    }

    public synchronized static JSONObject getFriend(int index)
    {
        JSONObject friend = null;
        if(g_friends != null && g_friends.length() > index)
        {
            friend = g_friends.optJSONObject(index);
        }
        return friend;
    }


    public synchronized static boolean isSynchronizing()
    {
        return g_bSynchronizing;
    }

    public synchronized static void setSynchronizing(boolean bSynchronizing)
    {
        g_bSynchronizing = bSynchronizing;
    }


    public synchronized static JSONArray getFriends(){
        return g_friends;
    }

    public synchronized static ArrayList<String> getFriendsAsArrayListOfStrings()
    {
        ArrayList<String> friendsAsArrayListOfStrings = new ArrayList<>();

        int numFriends = g_friends.length();

        for(int i = 0; i < numFriends; i++)
        {
            friendsAsArrayListOfStrings.add(UserInfo.getFriend(i).toString());
        }

        return friendsAsArrayListOfStrings;
    }

    public synchronized static ArrayList<String> getInvitableFriendsAsArrayListOfStrings()
    {
        ArrayList<String> friendsAsArrayListOfStrings = new ArrayList<>();

        for(int i = 0; i < g_invitableFriends.length(); i++)
        {
            JSONObject user = g_invitableFriends.optJSONObject(i);
            friendsAsArrayListOfStrings.add(user.toString());
        }

        return friendsAsArrayListOfStrings;
    }


    public synchronized static boolean isLoggedIn(){
        return g_bLoggedIn;
    }

    public synchronized static void setLoggedIn(boolean bLoggedIn)
    {
        g_bLoggedIn = bLoggedIn;

        if(g_bLoggedIn == false)
        {
            UserInfo.setCurrentFBUser(null);
            UserInfo.setFriends(null);
            UserInfo.setInvitableFriends(null);
        }

    }

    public synchronized static void setUsersScore(JSONArray scores)
    {
        g_userScores = scores;
    }

    public synchronized static JSONArray getUserScores()
    {
        return g_userScores;
    }



    public final static String fetchUserEmail(Context context){
        AccountManager accountManager = AccountManager.get(context);
        Account account = getAccount(accountManager);

        if(account == null)
        {
            return null;
        }
        return account.name;
    }

    private final static Account getAccount(AccountManager accountManager)
    {
        Account[] accounts = accountManager.getAccountsByType("com.google");
        Account account;
        if(accounts.length > 0)
        {
            account = accounts[0];
        }
        else
        {
            account = null;
        }
        return account;
    }

    public static boolean isUserInfoValid()
    {
        if(UserInfo.getCurrentFBUser() == null)
        {
            return false;
        }
        else if(UserInfo.getCurrentFBUser().toString().isEmpty() == true)
        {
            return false;
        }


        if(UserInfo.getEmail() == null)
        {
            return false;
        }
        else if(UserInfo.getEmail().isEmpty() == true){
            return false;
        }

        if(UserInfo.getDeviceToken() == null)
        {
            return false;
        }
        else if(UserInfo.getDeviceToken().isEmpty() == true)
        {
            return false;
        }

        return true;
    }

//    public static void inviteFriends(ArrayList<UserItem> userItemList, GameRequest.IGameRequestDialogListener listener)
//    {
//        if(userItemList.size() > 0)
//        {
//            UserItem item0= userItemList.get(0);
//
//            String strUserArray = "";
//
//            JSONObject object0 = item0.getUserObject();
//            if(object0 != null)
//            {
//                strUserArray = object0.optString("id");
//            }
//
//            for(int i = 1; i < userItemList.size(); i++)
//            {
//                UserItem item = userItemList.get(i);
//                JSONObject object = item.getUserObject();
//                if(object != null)
//                {
//                    if(item.isSelected() == true)
//                    {
//                        String strUserID = object.optString("id");
//                        strUserArray += "," + strUserID;
//                    }
//                }
//            }
//
//            GameRequest request = GameActivity.getInstance().getGameRequest();
//            request.setGameRequestDialogListener(listener);
//            request.showDialogForInvites("Invite","I'd like to invite you to this game.", strUserArray);
//        }
//    }
}
