package com.myjobpitch.widgets;

import android.content.Context;
import android.content.res.ColorStateList;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.SpinnerAdapter;
import android.widget.TextView;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * A modified Spinner that doesn't automatically select the first entry in the list.
 *
 * Shows the prompt if nothing is selected.
 *
 * Limitations: does not display prompt if the entry list is empty.
 */
public class NoDefaultSpinner extends Spinner {

    public NoDefaultSpinner(Context context) {
        super(context);
    }

    public NoDefaultSpinner(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public NoDefaultSpinner(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
    }

    @Override
    public void setAdapter(SpinnerAdapter orig ) {
        final SpinnerAdapter adapter = newProxy(orig);

        super.setAdapter(adapter);

        try {
            final Method m = AdapterView.class.getDeclaredMethod(
                               "setNextSelectedPositionInt",int.class);
            m.setAccessible(true);
            m.invoke(this,-1);

            final Method n = AdapterView.class.getDeclaredMethod(
                               "setSelectedPositionInt",int.class);
            n.setAccessible(true);
            n.invoke(this,-1);
        } 
        catch( Exception e ) {
            throw new RuntimeException(e);
        }
    }

    protected SpinnerAdapter newProxy(SpinnerAdapter obj) {
        return (SpinnerAdapter) java.lang.reflect.Proxy.newProxyInstance(
                obj.getClass().getClassLoader(),
                new Class[]{SpinnerAdapter.class},
                new SpinnerAdapterProxy(obj));
    }



    /**
     * Intercepts getView() to display the prompt if position < 0
     */
    protected class SpinnerAdapterProxy implements InvocationHandler {

        protected SpinnerAdapter obj;
        protected Method getView;


        protected SpinnerAdapterProxy(SpinnerAdapter obj) {
            this.obj = obj;
            try {
                this.getView = SpinnerAdapter.class.getMethod(
                                 "getView",int.class, View.class, ViewGroup.class);
            } 
            catch( Exception e ) {
                throw new RuntimeException(e);
            }
        }

        public Object invoke(Object proxy, Method m, Object[] args) throws Throwable {
            try {
                return m.equals(getView) && 
                       (Integer)(args[0])<0 ? 
                         getView((Integer)args[0],(View)args[1],(ViewGroup)args[2]) : 
                         m.invoke(obj, args);
            } 
            catch (InvocationTargetException e) {
                throw e.getTargetException();
            } 
            catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        protected View getView(int position, View convertView, ViewGroup parent) 
          throws IllegalAccessException {

            if( position<0 ) {
                final TextView v = 
                  (TextView) ((LayoutInflater)getContext().getSystemService(
                    Context.LAYOUT_INFLATER_SERVICE)).inflate(
                      android.R.layout.simple_list_item_1,parent,false);
                v.setText(getPrompt());
                v.setPadding(10, 5, getPaddingRight(), 5);
                ColorStateList hintColor = new EditText(getContext()).getHintTextColors();
                v.setTextColor(hintColor);
                return v;
            }
            return obj.getView(position,convertView,parent);
        }
    }
}