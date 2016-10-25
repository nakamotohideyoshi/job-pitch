package com.myjobpitch.utils;

import android.content.Context;
import android.graphics.Point;
import android.view.View;

import java.util.ArrayList;

import it.sephiroth.android.library.tooltip.Tooltip;

public class ToolTipHelper {

    ArrayList<ToolTipInfo> data;
    Context context;
    Callback callback;

    int step;

    public ToolTipHelper(Context context, ArrayList<ToolTipInfo> data, Callback callback) {
        this.context = context;
        this.data = data;
        this.callback = callback;

        this.step = 0;
        this.show();
    }

    private void show() {
        if (step >= data.size()) {
            if (callback != null) {
                callback.onTooltipEnd();
            }
            return;
        }

        ToolTipInfo info = data.get(step);

        Tooltip.Builder tb = new Tooltip.Builder(100)
                .closePolicy(new Tooltip.ClosePolicy()
                        .insidePolicy(true, true)
                        .outsidePolicy(true, true), 0)
                .text(info.text)
                .maxWidth(800)
                .fitToScreen(true)
                .floatingAnimation(Tooltip.AnimationBuilder.SLOW)
                .withCallback(new Tooltip.Callback() {
                    @Override
                    public void onTooltipClose(Tooltip.TooltipView tooltipView, boolean b, boolean b1) {
                        step++;
                        show();
                    }

                    @Override
                    public void onTooltipFailed(Tooltip.TooltipView tooltipView) {
                    }

                    @Override
                    public void onTooltipShown(Tooltip.TooltipView tooltipView) {
                    }

                    @Override
                    public void onTooltipHidden(Tooltip.TooltipView tooltipView) {
                    }
                });

        if (info.view != null) {
            tb.anchor(info.view, info.gravity);
        } else if (info.pos != null){
            tb.anchor(info.pos, info.gravity);
        }

        Tooltip.make(context, tb.build()).show();
    }

    public static final class ToolTipInfo {
        public CharSequence text;
        public Tooltip.Gravity gravity;
        public Point pos;
        public View view;
    }

    public static ToolTipInfo makeInfo(CharSequence text, View view, Tooltip.Gravity gravity) {
        ToolTipInfo info = new ToolTipInfo();
        info.text = text;
        info.view = view;
        info.gravity = gravity;
        return info;
    }

    public static ToolTipInfo makeInfo(CharSequence text, Point pos, Tooltip.Gravity gravity) {
        ToolTipInfo info = new ToolTipInfo();
        info.text = text;
        info.pos = pos;
        info.gravity = gravity;
        return info;
    }

    public interface Callback {
        void onTooltipEnd();
    }

}
