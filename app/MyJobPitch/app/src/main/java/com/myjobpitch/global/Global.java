package com.myjobpitch.global;


import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.TimeZone;



import android.annotation.SuppressLint;
import android.content.Context;

import android.content.SharedPreferences;
import android.util.DisplayMetrics;
import android.widget.Toast;



@SuppressLint("DefaultLocale")
public class Global {

	public static String md5(String s) {
		try {
			// Create MD5 Hash
			MessageDigest digest = MessageDigest.getInstance("MD5");
			digest.update(s.getBytes());
			byte messageDigest[] = digest.digest();

			// Create Hex String
			StringBuffer hexString = new StringBuffer();
			for (int i=0; i<messageDigest.length; i++)
				hexString.append(Integer.toHexString(0xFF & messageDigest[i]));
			return hexString.toString();

		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		return "";
	}

	public static String getProductID(int nBoostType)
	{
		switch(nBoostType)
		{
			case Constants.ID_PRODUCT_BOOSTER1:
			{
				return Constants.BP_PRODUCT_ID_BOOSTER1;
			}
			case Constants.ID_PRODUCT_BOOSTER2:
			{
				return Constants.BP_PRODUCT_ID_BOOSTER2;
			}
			case Constants.ID_PRODUCT_BOOSTER3:
			{
				return Constants.BP_PRODUCT_ID_BOOSTER3;
			}
			case Constants.ID_PRODUCT_BOOSTER4:
			{
				return Constants.BP_PRODUCT_ID_BOOSTER4;
			}
			case Constants.ID_PRODUCT_BOOSTER5:
			{
				return Constants.BP_PRODUCT_ID_BOOSTER5;
			}
			case Constants.ID_PRODUCT_BOOSTER6:
			{
				return Constants.BP_PRODUCT_ID_BOOSTER6;
			}

			case Constants.ID_PRODUCT_COINS0:
			{
				return Constants.BP_PRODUCT_ID_COINS0;
			}
			case Constants.ID_PRODUCT_COINS1:
			{
				return Constants.BP_PRODUCT_ID_COINS1;
			}
			case Constants.ID_PRODUCT_COINS2:
			{
				return Constants.BP_PRODUCT_ID_COINS2;
			}
			case Constants.ID_PRODUCT_COINS3:
			{
				return Constants.BP_PRODUCT_ID_COINS3;
			}
			case Constants.ID_PRODUCT_COINS4:
			{
				return Constants.BP_PRODUCT_ID_COINS4;
			}
			case Constants.ID_PRODUCT_COINS5:
			{
				return Constants.BP_PRODUCT_ID_COINS5;
			}
			case Constants.ID_PRODUCT_LIFE:
			{
				return Constants.BP_PRODUCT_ID_LIFE;
			}
		}
		return null;
	}

	public static int getProductID(String strProductID)
	{
		if(strProductID.equals(Constants.BP_PRODUCT_ID_BOOSTER1) == true)
		{
			return Constants.ID_PRODUCT_BOOSTER1;
		}
		else if(strProductID.equals(Constants.BP_PRODUCT_ID_BOOSTER2) == true)
		{
			return Constants.ID_PRODUCT_BOOSTER2;
		}
		else if(strProductID.equals(Constants.BP_PRODUCT_ID_BOOSTER3) == true)
		{
			return Constants.ID_PRODUCT_BOOSTER3;
		}
		else if(strProductID.equals(Constants.BP_PRODUCT_ID_BOOSTER4) == true)
		{
			return Constants.ID_PRODUCT_BOOSTER4;
		}
		else if(strProductID.equals(Constants.BP_PRODUCT_ID_BOOSTER5) == true)
		{
			return Constants.ID_PRODUCT_BOOSTER5;
		}
		else if(strProductID.equals(Constants.BP_PRODUCT_ID_BOOSTER6) == true)
		{
			return Constants.ID_PRODUCT_BOOSTER6;
		}
		else if(strProductID.equals(Constants.BP_PRODUCT_ID_COINS0) == true)
		{
			return Constants.ID_PRODUCT_COINS0;
		}
		else if(strProductID.equals(Constants.BP_PRODUCT_ID_COINS1) == true)
		{
			return Constants.ID_PRODUCT_COINS1;
		}
		else if(strProductID.equals(Constants.BP_PRODUCT_ID_COINS2) == true)
		{
			return Constants.ID_PRODUCT_COINS2;
		}
		else if(strProductID.equals(Constants.BP_PRODUCT_ID_COINS3) == true)
		{
			return Constants.ID_PRODUCT_COINS3;
		}
		else if(strProductID.equals(Constants.BP_PRODUCT_ID_COINS4) == true)
		{
			return Constants.ID_PRODUCT_COINS4;
		}
		else if(strProductID.equals(Constants.BP_PRODUCT_ID_COINS5) == true)
		{
			return Constants.ID_PRODUCT_COINS5;
		}
		else if(strProductID.equals(Constants.BP_PRODUCT_ID_LIFE) == true)
		{
			return Constants.ID_PRODUCT_LIFE;
		}

		return 0;
	}



	public static final float 		DEFAULT_PORTRAIT_W = 800;
	public static final float 		DEFAULT_PORTRAIT_H = 1280;
	
	public static float				CW = DEFAULT_PORTRAIT_W;
	public static float				CH = DEFAULT_PORTRAIT_H;
	


	public static float				F_BOOST_PANEL_Y = 0;
	public static float				F_BOUND_BALL_REMOVE = 0;
	
	public static float				F_SCENE_WIDTH = DEFAULT_PORTRAIT_W;
	public static float				F_SCENE_HEIGHT = DEFAULT_PORTRAIT_H;
	
	public static float 			F_RADIUS_BALL = F_SCENE_WIDTH / (float)(Constants.N_RECT_MAX_COLS);
	public static float				F_SCALE_BALL = F_RADIUS_BALL /64.0f;
	public static float 			F_VELOCITY_TMP = Global.F_RADIUS_BALL / 8.0f;

	public static float 			F_BOUND_X1 = 0;
	public static float 			F_BOUND_X2 = DEFAULT_PORTRAIT_W;
	public static float 			F_BOUND_Y1 = 0;
	public static float 			F_BOUND_Y2 = DEFAULT_PORTRAIT_H;
	
	public static float				F_BALL_BOUND_X1 = F_BOUND_X1;
	public static float				F_BALL_BOUND_X2 = F_BOUND_X2;
	public static float				F_BALL_BOUND_Y1 = F_BOUND_Y1;
	public static float				F_BALL_BOUND_Y2 = F_BOUND_Y2;
	
	private static int				m_nLives = Constants.N_LIVE_COUNT_LIMIT;
	private static int				m_nNewestLevel = 1;
	private static boolean			m_bNewLevelVisited = false;
	private static int				m_nScore = 0;
	private static int				m_nCoins = 0;
	private static boolean 			m_bShowedTutorialBuyCoins = false;
	private static int []			m_nBoosters = new int[5];

	private static boolean 			m_bMusicEnabled = true;
	private static boolean			m_bSoundEnabled = true;

	private static ArrayList<Integer>	m_listBoosterID = new ArrayList<Integer>();

	private static int				m_nCurLevelScore = 0;
	private static int				m_nTutorial = 0;

	public static int				m_nIconWidth = 0;
	public static int				m_nIconHeight = 0;



	private static int 				m_nYear;
	private static int				m_nDay;
	private static int				m_nHour;
	private static int 				m_nMin;
	private static int 				m_nSec;



	public static int getCurLevelScore()
	{
		return m_nCurLevelScore;
	}

	public static void setCurLevelScore(int nCurLevelScore)
	{
		m_nCurLevelScore = nCurLevelScore;
	}

	public static void setMusicEnabled(boolean bMusicEnabled)
	{
		m_bMusicEnabled = bMusicEnabled;
	}

	public static boolean getMusicEnabled()
	{
		return m_bMusicEnabled;
	}

	public static void setSoundEnabled(boolean bSoundEnabled)
	{
		m_bSoundEnabled = bSoundEnabled;
	}

	public static boolean getSoundEnabled()
	{
		return m_bSoundEnabled;
	}

	public static boolean			G_LEVEL_MAP_VISITED = false;
	private static int				m_nGameMode = 0;

	private static boolean  m_bIapFrameShowed = false;
	private static String	m_strPurchasedItem = "";
	private static String   m_strPurchaseResult = "";

	public static synchronized void setIapFrameState(boolean bState)
	{
		m_bIapFrameShowed = bState;
	}
	public static synchronized boolean isIapFrameShowed()
	{
		return m_bIapFrameShowed;
	}
	public static synchronized String getPurchasedItem(){
		return m_strPurchasedItem;
	}

	public static synchronized void setPurchasedItem(String strPurchasedItem){
		m_strPurchasedItem = strPurchasedItem;
	}

	public static synchronized String getPurchaseResult(){
		return m_strPurchaseResult;
	}

	public static synchronized void setPurchaseResult(String strPurchaseResult){m_strPurchaseResult = strPurchaseResult;}

	public static int getTutorialID()
	{
		return m_nTutorial;
	}

	public static void setTutorialID(int nTutorialID)
	{
		m_nTutorial = nTutorialID;
	}

	public static int getCoins()
	{
		return m_nCoins;
	}

	public static void setCoins(int nCoins)
	{
		m_nCoins = nCoins;
	}

	public static int getScore()
	{
		return m_nScore;
	}

	public static void setScore(int nScore)
	{
		m_nScore = nScore;
	}

	public static int getBoosters(int nIdx)
	{
		return m_nBoosters[nIdx];
	}

	public static void setBoosters(int nIdx, int nValue)
	{
		m_nBoosters[nIdx] = nValue;
	}

	public static ArrayList<Integer> getListBoosterID()
	{
		return m_listBoosterID;
	}

	public static boolean getShowedTutorialBuyCoins()
	{
		return m_bShowedTutorialBuyCoins;
	}


	public static void setShowedTutorialBuyCoins(boolean bShowedTutorialBuyCoins)
	{
		m_bShowedTutorialBuyCoins = bShowedTutorialBuyCoins;
	}

	public static void setNewestLevel(int nNewestLevel)
	{
		m_nNewestLevel = nNewestLevel;
	}

	public static int getNewestLevel()
	{
		if(m_nNewestLevel > 50)
		{
			m_nNewestLevel = 50;
		}
		return m_nNewestLevel;
	}
	
	public static boolean isThisLevelVisited()
	{
		return m_bNewLevelVisited;
	}

	public static void setNewLevelVisited(boolean bNewLevelVisited)
	{
		m_bNewLevelVisited = bNewLevelVisited;
	}

	public static void showToast(Context context, String message){

		Toast.makeText(context, message, Toast.LENGTH_LONG).show();
	}

	public static int getLiveCount()
	{
		return m_nLives;
	}
	public static void setLiveCount(int nLives){m_nLives = nLives;}

	public static void addLives(int nLives)
	{
		m_nLives += nLives;
		if(m_nLives > Constants.N_LIVE_COUNT_LIMIT)
		{
			m_nLives = Constants.N_LIVE_COUNT_LIMIT;
		}

	}
	
	public static void decreaseLiveCount()
	{
		m_nLives --;
		if(m_nLives < 0)
		{
			m_nLives = 0;
		}

		Global.saveTimeInfo();
	}

	public static void saveTimeInfo()
	{
		Calendar cal = GregorianCalendar.getInstance(TimeZone.getTimeZone("UTC+0"));
		m_nYear = cal.get(Calendar.YEAR);
		m_nDay = cal.get(Calendar.DAY_OF_YEAR);
		m_nHour = cal.get(Calendar.HOUR_OF_DAY);
		m_nMin = cal.get(Calendar.MINUTE);
		m_nSec = cal.get(Calendar.SECOND);

		//SharedPreferences preferences = GameApplication.getInstance().getApplicationContext().getSharedPreferences("TimeInfo", Context.MODE_PRIVATE);
		//SharedPreferences.Editor editor = preferences.edit();
//		editor.putInt("time_year", m_nYear);
//		editor.putInt("time_day", m_nDay);
//		editor.putInt("time_hour", m_nHour);
//		editor.putInt("time_min", m_nMin);
//		editor.putInt("time_sec", m_nSec);
//		editor.commit();

//		if(ParseUser.getCurrentUser() != null)
//		{
//			ParseUser.getCurrentUser().put("time_year", m_nYear);
//			ParseUser.getCurrentUser().put("time_day", m_nDay);
//			ParseUser.getCurrentUser().put("time_hour", m_nHour);
//			ParseUser.getCurrentUser().put("time_min", m_nMin);
//			ParseUser.getCurrentUser().put("time_sec", m_nSec);
//			ParseUser.getCurrentUser().saveInBackground();
//		}
	}

	public static void loadTimeInfo()
	{
//		if(ParseUser.getCurrentUser() != null)
//		{
//			m_nYear = ParseUser.getCurrentUser().getInt("time_year");
//			m_nDay = ParseUser.getCurrentUser().getInt("time_day");
//			m_nHour = ParseUser.getCurrentUser().getInt("time_hour");
//			m_nMin = ParseUser.getCurrentUser().getInt("time_min");
//			m_nSec = ParseUser.getCurrentUser().getInt("time_sec");
//		}
//		else
//		{
//			Calendar cal = GregorianCalendar.getInstance(TimeZone.getTimeZone("UTC+0"));
//			SharedPreferences preferences = GameApplication.getInstance().getApplicationContext().getSharedPreferences("TimeInfo", Context.MODE_PRIVATE);
//			m_nYear = preferences.getInt("time_year", cal.get(Calendar.YEAR));
//			m_nDay = preferences.getInt("time_day", cal.get(Calendar.DAY_OF_YEAR));
//			m_nHour = preferences.getInt("time_hour", cal.get(Calendar.HOUR_OF_DAY));
//			m_nMin = preferences.getInt("time_min", cal.get(Calendar.MINUTE));
//			m_nSec = preferences.getInt("time_sec", cal.get(Calendar.SECOND));
//		}
	}

//	public static void setThisLevelVisited()
//	{
//		m_bNewLevelVisited = true;
//		GameApplication.saveGameInfo();
//	}
//
//	public static void increaseNewLevel()
//	{
//		m_nNewestLevel = m_nNewestLevel + 1;
//		m_bNewLevelVisited = false;
//		Network.onShareAchievement(m_nNewestLevel);
//		GameApplication.saveGameInfo();
//	}
//
//
//	public static void initCoordinates(CropResolutionPolicy rp)
//	{
//		final DisplayMetrics displayMetrics = new DisplayMetrics();
//		GameActivity.getInstance().getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
//
//	   	Global.F_BOUND_Y2 = rp.getTop();
//		Global.F_BOUND_Y1 = rp.getBottom();
//		Global.F_BOUND_X1 = rp.getLeft();
//		Global.F_BOUND_X2 = rp.getRight();
//
//		Global.F_SCENE_WIDTH =  rp.getUserWidth();
//		Global.F_SCENE_HEIGHT = rp.getUserHeight();
//
//		float fWidth = Global.F_SCENE_WIDTH;
//		Global.F_RADIUS_BALL = fWidth / (float)(Constants.N_RECT_MAX_COLS);
//		Global.F_SCALE_BALL = Global.F_RADIUS_BALL /64.0f;
//		Global.F_VELOCITY_TMP = Global.F_RADIUS_BALL /8.0f;
//
//		Global.F_BALL_BOUND_X1 = Global.F_BOUND_X1 + Global.F_RADIUS_BALL /2.0f;
//		Global.F_BALL_BOUND_X2 = Global.F_BOUND_X2 - Global.F_RADIUS_BALL /2.0f;
//		Global.F_BALL_BOUND_Y1 = Global.F_BOUND_Y1 + Global.F_RADIUS_BALL /2.0f;
//		Global.F_BALL_BOUND_Y2 = Global.F_BOUND_Y2 - Global.F_RADIUS_BALL /2.0f;
//	}

	public static int getElapsedTimeForLive()
	{
		Calendar cal = GregorianCalendar.getInstance(TimeZone.getTimeZone("UTC+0"));

		int nYear = cal.get(Calendar.YEAR);

		if(nYear != m_nYear)
		{
			return -1;
		}

		int nDay = cal.get(Calendar.DAY_OF_YEAR);
		int nHour = cal.get(Calendar.HOUR_OF_DAY);
		int nMin = cal.get(Calendar.MINUTE);
		int nSec = cal.get(Calendar.SECOND);

		int nElapsedTime = (nDay - m_nDay) * 24 * 3600 + (nHour - m_nHour) * 3600 + (nMin - m_nMin) * 60 + (nSec - m_nSec);
		return nElapsedTime;
	}

	public static int getCurrentTimeForUTC0()
	{
		Calendar cal = GregorianCalendar.getInstance(TimeZone.getTimeZone("UTC+0"));

		int nDay = cal.get(Calendar.DAY_OF_YEAR);
		int nHour = cal.get(Calendar.HOUR_OF_DAY);
		int nMin = cal.get(Calendar.MINUTE);
		int nSec = cal.get(Calendar.SECOND);

		int nCurrentTime = nDay * 24 * 3600 + nHour * 3600 + nMin * 60 + nSec;
		return nCurrentTime;
	}

	public static int getGameMode()
	{
		return m_nGameMode;
	}
	public static void setGameMode(int nGameMode)
	{
		m_nGameMode = nGameMode;
	}


}
