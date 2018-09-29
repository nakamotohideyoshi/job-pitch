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

    ArrayList<Integer> buttons = new ArrayList<>(Arrays.asList(R.id.button1, R.id.button2, R.id.button3));

    public enum  ButtonType {
        BT_GREEN, BT_YELLOW, BT_BLUE, BT_GREY
    }

    public Popup(Context context, String message, boolean cancelable) {
        super(context);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setBackgroundDrawable(new ColorDrawable(android.graphics.Color.TRANSPARENT));
        setContentView(R.layout.view_popup);
        setCancelable(cancelable);

        ((TextView)findViewById(R.id.title)).setText(message);
    }

    public Button addButton(String text, ButtonType type, final View.OnClickListener listner) {
        if (buttons.size() == 0) {
            return null;
        }

        Button button = (Button)findViewById(buttons.get(0));
        button.setVisibility(View.VISIBLE);
        button.setText(text);

        switch (type) {
            case BT_GREEN:
                button.setBackgroundResource(R.drawable.button_green);
                break;
            case BT_YELLOW:
                button.setBackgroundResource(R.drawable.button_yellow);
                break;
            case BT_BLUE:
                button.setBackgroundResource(R.drawable.button_blue);
                break;
            case BT_GREY:
                button.setBackgroundResource(R.drawable.button_grey);
                break;
        }

        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                dismiss();
                if (listner != null) listner.onClick(v);
            }
        });

        buttons.remove(0);

        return button;
    }

    public Button addGreenButton(String text, final View.OnClickListener listner) {
        return addButton(text, ButtonType.BT_GREEN, listner);
    }

    public Button addYellowButton(String text, final View.OnClickListener listner) {
        return addButton(text, ButtonType.BT_YELLOW, listner);
    }

    public Button addBlueButton(String text, final View.OnClickListener listner) {
        return addButton(text, ButtonType.BT_BLUE, listner);
    }

    public Button addGreyButton(String text, final View.OnClickListener listner) {
        return addButton(text, ButtonType.BT_GREY, listner);
    }

}
