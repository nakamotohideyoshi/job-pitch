package com.myjobpitch.fragments;

import android.content.Context;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import com.myjobpitch.R;

import com.daprlabs.aaron.swipedeck.SwipeDeck;
import com.myjobpitch.utils.AppHelper;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;

public class SwipeFragment<T> extends BaseFragment {

    @BindView(R.id.swipe_deck)
    SwipeDeck cardStack;

    @BindView(R.id.empty_view)
    View emptyView;

    @BindView(R.id.empty_button)
    View emptyButton;

    @BindView(R.id.credits)
    TextView creditsView;

    protected int topCardItemId = 0;

    protected SwipeDeckAdapter adapter;

    protected View initView(LayoutInflater inflater, ViewGroup container, String emptyText) {
        View view = inflater.inflate(R.layout.fragment_swipe, container, false);
        ButterKnife.bind(this, view);

        // empty view
        AppHelper.setEmptyViewText(emptyView, emptyText);
        emptyButton.setVisibility(View.GONE);

        // refresh button
        addMenuItem(MENUGROUP1, 100, "Refresh", R.drawable.ic_refresh);

        return  view;
    }

    @Override
    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);

        // card list

        if (adapter == null) {
            adapter = new SwipeDeckAdapter(getApp(), new ArrayList<T>());
            loadData();
        } else {
            emptyView.setVisibility(adapter.getCount()==0 ? View.VISIBLE : View.GONE);
        }

        cardStack.setAdapter(adapter);
        cardStack.setAdapterIndex(topCardItemId);
        cardStack.setLeftImage(R.id.left_mark);
        cardStack.setRightImage(R.id.right_mark);

        cardStack.setCallback(new SwipeDeck.SwipeDeckCallback() {
            @Override
            public void cardSwipedLeft(long stableId) {
                swipedLeft(adapter.getItem((int)stableId));
                topCardItemId = (int)cardStack.getTopCardItemId();
                if (topCardItemId == -1) {
                    emptyView.setVisibility(View.VISIBLE);
                }
            }
            @Override
            public void cardSwipedRight(long stableId) {
                swipedRight(adapter.getItem((int)stableId));
                topCardItemId = (int)cardStack.getTopCardItemId();
                if (topCardItemId == -1) {
                    emptyView.setVisibility(View.VISIBLE);
                }
            }
            @Override
            public boolean isDragEnabled(long itemId) {
                return true;
            }
        });

        if (adapter.getCount() != 0) {
            adapter.notifyDataSetChanged();
        }
    }

    protected void setData(List<T> data) {
        if (data != null) {
            adapter.clear();
            adapter.addAll(data);
            topCardItemId = 0;
            emptyView.setVisibility(adapter.getCount()==0 ? View.VISIBLE : View.GONE);
        }
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 100) {
            loadData();
        }
    }

    // swipe adapter ========================================

    class SwipeDeckAdapter extends ArrayAdapter<T> {

        public SwipeDeckAdapter(Context context, List<T> objects) {
            super(context, 0, objects);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {

            if (convertView == null) {
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.view_swipe_card, parent, false);

                convertView.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        int index = (int)cardStack.getTopCardItemId();
                        selectedCard(getItem(index));
                    }
                });
            }

            showDeckInfo(adapter.getItem(position), convertView);

            return convertView;
        }
    }

    protected View getCardImageContainer(View view) {
        return view.findViewById(R.id.image_loader);
    }

    protected void setCardTitle(View view, String title) {
        ((TextView)view.findViewById(R.id.card_title)).setText(title);
    }

    protected void setCardDesc(View view, String desc) {
        ((TextView)view.findViewById(R.id.card_desc)).setText(desc);
    }

    // override method

    protected void loadData() {
    }

    protected void showDeckInfo(T object, View view) {
    }

    protected void swipedLeft(T object) {
    }

    protected void swipedRight(T object) {
    }

    protected void selectedCard(T object) {
    }

}
