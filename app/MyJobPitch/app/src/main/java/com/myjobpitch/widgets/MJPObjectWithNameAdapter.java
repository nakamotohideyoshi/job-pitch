package com.myjobpitch.widgets;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import com.myjobpitch.api.MJPObjectWithName;

import java.util.List;

/**
 * Created by Jamie on 11/04/2015.
 */
public class MJPObjectWithNameAdapter<T extends MJPObjectWithName> extends ArrayAdapter<T> {

    public MJPObjectWithNameAdapter(Context context, int resource) {
        super(context, resource);
    }

    public MJPObjectWithNameAdapter(Context context, int resource, int textViewResourceId) {
        super(context, resource, textViewResourceId);
    }

    public MJPObjectWithNameAdapter(Context context, int resource, T[] objects) {
        super(context, resource, objects);
    }

    public MJPObjectWithNameAdapter(Context context, int resource, int textViewResourceId, T[] objects) {
        super(context, resource, textViewResourceId, objects);
    }

    public MJPObjectWithNameAdapter(Context context, int resource, List<T> objects) {
        super(context, resource, objects);
    }

    public MJPObjectWithNameAdapter(Context context, int resource, int textViewResourceId, List<T> objects) {
        super(context, resource, textViewResourceId, objects);
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        TextView view = (TextView) super.getView(position, convertView, parent);
        MJPObjectWithName object = getItem(position);
        if (object != null)
            view.setText(object.getName());
        return view;
    }

    @Override
    public View getDropDownView(int position, View convertView, ViewGroup parent) {
        TextView view = (TextView) super.getDropDownView(position, convertView, parent);
        MJPObjectWithName object = getItem(position);
        if (object != null)
            view.setText(object.getName());
        return view;
    }
}
