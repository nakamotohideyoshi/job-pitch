package com.myjobpitch.global;

/**
 * Created by Yanev on 1/14/2016.
 */
public class Constants {

    public final static int			N_TUTORIAL_TAP = 1;
    public final static int			N_TUTORIAL_CANNON = 2;
    public final static int			N_TUTORIAL_BOOST = 3;
    public final static int			N_TUTORIAL_SWITCH = 4;
    public final static int			N_TUTORIAL_READY_BOOST_BALL = 5;
    public final static int 		N_TUTORIAL_PLUS = 6;
    public final static int 		N_TUTORIAL_BUY_COINS = 7;

    public final static int 		N_LIVE_COUNT_LIMIT = 5;

    public static final int 		N_RECT_MAX_COLS = 12;
    public static final int			N_RECT_MAX_ROWS = 91;
    public static final int 		N_CIRCLE_MAX_ROWS = 10;
    public static final int			N_AROUND_POINTS = 6;
    public static final int 		N_CIRCLE_MAX_COLS = Constants.N_CIRCLE_MAX_ROWS * N_AROUND_POINTS;
    public final static int			N_TIME_LIMIT_FOR_LIVE = 600;


    public static final int 		N_TYPE_MAX_COUNT = 9;
    public static final int			N_FRAME_COUNT = 50;
    public static final int			N_FRAME_COUNT_MOVE_LINE = 30;

    public static final	int			N_ZORDER_BACKGROUND = 1;
    public static final	int			N_ZORDER_LEFT_PANEL = 4;

    public static final int			N_ZORDER_BOOST_PANEL = 6;

    public static final	int			N_ZORDER_BALL = 3;

    public static final int			N_ZORDER_TEMP_BALL = 5;

    public static final	int			N_ZORDER_CANNON = N_ZORDER_BALL ;
    public static final int			N_ZORDER_ANIMATION = N_ZORDER_CANNON + 1;

    public static final float		F_VELOCITY_RATE = 1 / 10.0f;


    public static final int FPS_LIMIT = 60;

    public static final String BP_PRODUCT_ID_BOOSTER1 = "booster1";
    public static final String BP_PRODUCT_ID_BOOSTER2 = "booster2";
    public static final String BP_PRODUCT_ID_BOOSTER3 = "booster3";
    public static final String BP_PRODUCT_ID_BOOSTER4 = "booster4";
    public static final String BP_PRODUCT_ID_BOOSTER5 = "booster5";
    public static final String BP_PRODUCT_ID_BOOSTER6 = "booster6";

    public static final String BP_PRODUCT_ID_COINS0 = "coins0";
    public static final String BP_PRODUCT_ID_COINS1 = "coins1";
    public static final String BP_PRODUCT_ID_COINS2 = "coins2";
    public static final String BP_PRODUCT_ID_COINS3 = "coins3";
    public static final String BP_PRODUCT_ID_COINS4 = "coins4";
    public static final String BP_PRODUCT_ID_COINS5 = "coins5";
    public static final String BP_PRODUCT_ID_LIFE = "life";

    public static final int    ID_PRODUCT_BOOSTER1 = 6000;
    public static final int    ID_PRODUCT_BOOSTER2 = 6001;
    public static final int    ID_PRODUCT_BOOSTER3 = 6002;
    public static final int    ID_PRODUCT_BOOSTER4 = 6003;
    public static final int    ID_PRODUCT_BOOSTER5 = 6004;
    public static final int    ID_PRODUCT_BOOSTER6 = 6005;

    public static final int    ID_PRODUCT_COINS0 = 6006;
    public static final int    ID_PRODUCT_COINS1 = 6007;
    public static final int    ID_PRODUCT_COINS2 = 6008;
    public static final int    ID_PRODUCT_COINS3 = 6009;
    public static final int    ID_PRODUCT_COINS4 = 6010;
    public static final int    ID_PRODUCT_COINS5 = 6011;
    public static final int    ID_PRODUCT_LIFE = 6012;

}
