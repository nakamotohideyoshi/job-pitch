package com.myjobpitch.utils;

import android.content.Context;
import android.support.v4.content.ContextCompat;

import com.kaopiz.kprogresshud.KProgressHUD;
import com.myjobpitch.MainActivity;
import com.myjobpitch.R;

public class Loading {

    private static KProgressHUD loadingBar;

    public static KProgressHUD getLoadingBar() {
        return loadingBar;
    }

    public static void show(final String label) {
        show(MainActivity.instance, label);
    }

    public static void show(final Context context, final String label) {
        if (loadingBar == null) {
            loadingBar = KProgressHUD.create(context)
                    .setStyle(KProgressHUD.Style.SPIN_INDETERMINATE)
                    .setCancellable(false)
                    .setDimAmount(0.65f)
                    .setWindowColor(ContextCompat.getColor(context, R.color.colorPopup))
                    .show();
        }
        loadingBar.setLabel(label.isEmpty() ? null : label);
    }

    public static void hide() {
        if (loadingBar != null) {
            loadingBar.dismiss();
            loadingBar = null;
        }
    }

}
