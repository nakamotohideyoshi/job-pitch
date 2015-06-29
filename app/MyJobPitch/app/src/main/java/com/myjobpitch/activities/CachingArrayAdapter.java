package com.myjobpitch.activities;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;

import java.util.List;
import java.util.Map;
import java.util.WeakHashMap;

/**
 * Created by jcockburn on 27/05/2015.
 */
public abstract class CachingArrayAdapter<T> extends ArrayAdapter<T> {
    private Map<Object, View> viewCache = new WeakHashMap<>();
    private Object viewCacheLock = new Object();

    public CachingArrayAdapter(Context context, int resource, List<T> objects) {
        super(context, resource, objects);
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        T object = this.getItem(position);
        View view;

        synchronized (viewCacheLock) {
            if (viewCache.containsKey(object))
                return viewCache.get(object);
            view = createView(position, convertView, parent, object);
            viewCache.put(object, view);
        }
        return view;
    }

    @Override
    public void notifyDataSetChanged() {
        synchronized (viewCacheLock) {
            viewCache.clear();
            super.notifyDataSetChanged();
        }
    }

    protected abstract View createView(int position, View convertView, ViewGroup parent, T object);
}
