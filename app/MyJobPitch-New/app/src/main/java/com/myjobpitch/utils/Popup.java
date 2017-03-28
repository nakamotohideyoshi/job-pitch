package com.myjobpitch.utils;

import android.app.Dialog;
import android.content.Context;
import android.graphics.drawable.ColorDrawable;
import android.view.View;
import android.view.ViewManager;
import android.view.Window;
import android.widget.Button;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.MainActivity;

public class Popup {

    private Dialog dialog;
    private TextView titleView;
    public Button button1;
    public Button button2;

    private View.OnClickListener listner1;
    private View.OnClickListener listner2;

    public Popup(Context context, String message, String textBtn1, final View.OnClickListener listener1, String textBtn2, final View.OnClickListener listener2, boolean cancelable) {

        this.listner1 = listener1;
        this.listner2 = listener2;

        dialog = new Dialog(context);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        dialog.getWindow().setBackgroundDrawable(new ColorDrawable(android.graphics.Color.TRANSPARENT));
        dialog.setContentView(R.layout.view_popup);
        dialog.setCancelable(cancelable);

        titleView = (TextView)dialog.findViewById(R.id.title);
        titleView.setText(message);

        button1 = (Button)dialog.findViewById(R.id.button1);
        if (textBtn1 != null) {
            button1.setText(textBtn1);
            button1.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    dialog.dismiss();
                    if (listener1 != null) listener1.onClick(v);
                }
            });
        } else {
            ((ViewManager)button1.getParent()).removeView(button1);
            button1 = null;
        }

        button2 = (Button)dialog.findViewById(R.id.button2);
        if (textBtn2 != null) {
            button2.setText(textBtn2);
            button2.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    dialog.dismiss();
                    if (listener2 != null) listener2.onClick(v);
                }
            });
        } else {
            ((ViewManager)button2.getParent()).removeView(button2);
            button2 = null;
        }

        dialog.show();

    }

    public static Popup showGreen(String message, String textBtn1, final View.OnClickListener listener1, String textBtn2, final View.OnClickListener listener2, boolean cancelable) {
        AppHelper.hideLoading();
        Popup popup = new Popup(MainActivity.instance, message, textBtn1, listener1, textBtn2, listener2, cancelable);
        if (popup.button1 != null) {
            popup.button1.setBackgroundResource(R.drawable.button_green);
        }
        return popup;
    }

    public static Popup showYellow(String message, String textBtn1, final View.OnClickListener listener1, String textBtn2, final View.OnClickListener listener2, boolean cancelable) {
        AppHelper.hideLoading();
        Popup popup = new Popup(MainActivity.instance, message, textBtn1, listener1, textBtn2, listener2, cancelable);
        if (popup.button1 != null) {
            popup.button1.setBackgroundResource(R.drawable.button_yellow);
        }
        return popup;
    }

    public static Popup showMessage(String message) {
        AppHelper.hideLoading();
        Popup popup = new Popup(MainActivity.instance, message, null, null, "Ok", null, true);
        return popup;
    }

}
