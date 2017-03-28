package com.myjobpitch.utils;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import com.myjobpitch.MainActivity;
import com.myjobpitch.R;

import java.util.List;

public class SpinnerAdapter<T extends Object> extends ArrayAdapter<String> {

    public SpinnerAdapter(Context context, int resource, T[] objects, String hint) {
        super(context, resource);

        for (T obj: objects) {
            add(obj.toString());
        }
        add(hint);
    }
    public SpinnerAdapter(Context context, int resource, List<T> objects, String hint) {
        super(context, resource);

        for (T obj: objects) {
            add(obj.toString());
        }
        add(hint);
    }

    @Override
    public int getCount() {
        return super.getCount() - 1;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        TextView view = (TextView) super.getView(position, convertView, parent);
        if (position == getCount()) {
            view.setText("");
            view.setHint(getItem(position).toString());
            view.setHintTextColor(MainActivity.instance.getResources().getColor(R.color.greyLabel));
        }
        return view;
    }

}
