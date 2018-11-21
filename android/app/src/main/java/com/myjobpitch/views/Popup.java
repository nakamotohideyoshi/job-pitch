package com.myjobpitch.views;

import android.app.Dialog;
import android.content.Context;
import android.graphics.drawable.ColorDrawable;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.TextView;

import com.myjobpitch.R;

import java.util.ArrayList;
import java.util.Arrays;

public class Popup extends Dialog {

    private static final ArrayList<Integer> BACKGROUNDS = new ArrayList<>(Arrays.asList(R.drawable.button_green, R.drawable.button_yellow, R.drawable.button_grey));
    private static final int BT_GREEN = 0;
    private static final int BT_YELLOW = 1;
    private static final int BT_GREY = 2;

    private ArrayList<Integer> buttons = new ArrayList<>(Arrays.asList(R.id.button1, R.id.button2, R.id.button3));

    public Popup(Context context) {
        super(context);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setBackgroundDrawable(new ColorDrawable(android.graphics.Color.TRANSPARENT));
        setContentView(R.layout.view_popup);
    }

    public Popup setMessage(String text) {
        ((TextView)findViewById(R.id.title)).setText(text);
        return this;
    }

    public Popup setMessage(int resId) {
        ((TextView)findViewById(R.id.title)).setText(resId);
        return this;
    }

    private Popup addButton(int type, String text, final View.OnClickListener listener) {

        if (buttons.size() == 0) return null;

        Button button = findViewById(buttons.get(0));
        button.setVisibility(View.VISIBLE);
        button.setBackgroundResource(BACKGROUNDS.get(type));
        button.setText(text);
        button.setOnClickListener(v -> {
            dismiss();
            if (listener != null) listener.onClick(v);
        });

        buttons.remove(0);

        return this;
    }

    public Popup addGreenButton(int resId, final View.OnClickListener listener) {
        return addButton(BT_GREEN, getContext().getResources().getString(resId), listener);
    }

    public Popup addGreenButton(String text, final View.OnClickListener listener) {
        return addButton(BT_GREEN, text, listener);
    }

    public Popup addYellowButton(int resId, final View.OnClickListener listener) {
        return addButton(BT_YELLOW, getContext().getResources().getString(resId), listener);
    }

    public Popup addYellowButton(String text, final View.OnClickListener listener) {
        return addButton(BT_YELLOW, text, listener);
    }

    public Popup addGreyButton(int resId, final View.OnClickListener listener) {
        return addButton(BT_GREY, getContext().getResources().getString(resId), listener);
    }

    public Popup addGreyButton(String text, final View.OnClickListener listener) {
        return addButton(BT_GREY, text, listener);
    }

}
