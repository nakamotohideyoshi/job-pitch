package com.myjobpitch.views;

import android.app.AlertDialog;
import android.content.Context;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TextView;

import com.myjobpitch.R;

import java.util.ArrayList;
import java.util.List;

public class SelectDialog extends ArrayAdapter<SelectDialog.SelectItem> {

    private AlertDialog dialog;
    private Action acion;
    private List<SelectItem> data;
    private boolean multiselect;

    public SelectDialog(Context context, String title, List<SelectItem> data, boolean multiselect, final Action action) {

        super(context, 0, new ArrayList<>());

        this.multiselect = multiselect;
        this.acion = action;

        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        builder.setTitle(title);

        LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View view = inflater.inflate(R.layout.view_select, null);
        builder.setView(view);

        ListView listView = view.findViewById(R.id.listView);
        listView.setAdapter(this);

        EditText filterText = view.findViewById(R.id.filterText);
        filterText.addTextChangedListener(new TextWatcher() {
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filter(s.toString());
            }
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }
            @Override
            public void afterTextChanged(Editable s) {
            }
        });

        if (multiselect) {
            builder.setPositiveButton(R.string.ok, (dialog, which) -> action.apply(-1));
        }

        builder.setNegativeButton(R.string.cancel, null);
        dialog = builder.show();

        this.data = data;
        filter("");
    }

    private void filter(String filterText) {
        this.clear();
        for (SelectItem item : data) {
            if (filterText.isEmpty() || item.label.toLowerCase().contains(filterText.toLowerCase())) {
                this.add(item);
            }
        }
    }

    private void hideKeyboard() {
        View view = dialog.getCurrentFocus();
        if (view != null) {
            InputMethodManager imm = (InputMethodManager)getContext().getSystemService(Context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
        }
    }

    @Override
    public View getView(final int position, View convertView, ViewGroup parent) {

        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.cell_multi_select, parent, false);
            if (!multiselect) {
                CheckBox checkBox = convertView.findViewById(R.id.item_checkbox);
                ((ViewGroup)checkBox.getParent()).removeView(checkBox);
            }
        }

        convertView.setOnClickListener(v -> {
            SelectItem item = getItem(position);
            if (multiselect) {
                item.checked = !item.checked;
                notifyDataSetChanged();
            } else {
                hideKeyboard();
                acion.apply(data.indexOf(item));
                dialog.hide();
            }
        });

        SelectItem item = getItem(position);

        TextView textView = convertView.findViewById(R.id.item_label);
        textView.setText(item.label);
        if (multiselect) {
            CheckBox checkBox = convertView.findViewById(R.id.item_checkbox);
            checkBox.setChecked(item.checked);
        }

        return convertView;
    }

    public interface Action {
        void apply(int selectedIndex);
    }

    static public class SelectItem {
        public String label;
        public boolean checked;
        public SelectItem(String label, boolean checked) {
            this.label = label;
            this.checked = checked;
        }
    }
}
