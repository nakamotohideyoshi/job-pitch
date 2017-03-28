package com.myjobpitch;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.design.widget.NavigationView;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;

import com.facebook.drawee.backends.pipeline.Fresco;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.fragments.BaseFragment;
import com.myjobpitch.fragments.BusinessListFragment;
import com.myjobpitch.fragments.ChangePasswordFragment;
import com.myjobpitch.fragments.FindJobFragment;
import com.myjobpitch.fragments.HelpFragment;
import com.myjobpitch.fragments.JobProfileFragment;
import com.myjobpitch.fragments.TalentApplicationsFragment;
import com.myjobpitch.fragments.TalentProfileFragment;
import com.myjobpitch.fragments.LoginFragment;
import com.myjobpitch.fragments.MessageListFragment;
import com.myjobpitch.fragments.PaymentFragment;
import com.myjobpitch.fragments.PitchFragment;
import com.myjobpitch.fragments.SelectJobFragment;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.Popup;

import butterknife.BindView;
import butterknife.ButterKnife;

public class MainActivity extends AppCompatActivity
        implements NavigationView.OnNavigationItemSelectedListener {

    public static MainActivity instance;

    @BindView(R.id.drawer_layout)
    DrawerLayout mDrawer;

    @BindView(R.id.nav_view)
    NavigationView mNavigationView;

    @BindView(R.id.toolbar)
    Toolbar mToolbar;

    @BindView(R.id.content_main)
    ViewGroup mContentView;

    FragmentManager mFragmentManager;

    int mCurrentPageID = -1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ButterKnife.bind(this);

        Fresco.initialize(getApplicationContext());

        instance = this;
        mFragmentManager = getSupportFragmentManager();

        mDrawer.setDrawerLockMode(DrawerLayout.LOCK_MODE_LOCKED_CLOSED);
        mNavigationView.setNavigationItemSelectedListener(this);
        mToolbar.setNavigationIcon(R.drawable.ic_menu);
        setSupportActionBar(mToolbar);

        replaceFragment(new LoginFragment());
    }

    public int getCurrentPageID() {
        return mCurrentPageID;
    }

    public void setRootFragement(int pageID) {

        // checked menu item

        Menu menu = mNavigationView.getMenu();
        if (mCurrentPageID != -1) {
            menu.findItem(mCurrentPageID).setChecked(false);
        }
        mCurrentPageID = pageID;
        menu.findItem(mCurrentPageID).setChecked(true);

        // new fragment

        MenuItemInfo info = menuItemData[pageID];

        BaseFragment fragment = null;
        try {
            fragment = (BaseFragment) info.fragmentClass.newInstance();
            fragment.title = info.title;
        } catch (Exception e) {
        }

        while (mFragmentManager.getBackStackEntryCount() > 0) {
            mFragmentManager.popBackStackImmediate();
        }
        mToolbar.setNavigationIcon(R.drawable.ic_menu);

        replaceFragment(fragment);
    }

    public void replaceFragment(BaseFragment fragment) {
        String tag = "" + (mFragmentManager.getBackStackEntryCount());
        mFragmentManager
                .beginTransaction()
                .replace(R.id.content_main, fragment, tag)
                .setTransition(FragmentTransaction.TRANSIT_FRAGMENT_FADE)
                .commit();

        mToolbar.getMenu().clear();
        hideKeyboard();
    }

    public void pushFragment(BaseFragment fragment) {
        String tag = "" + (mFragmentManager.getBackStackEntryCount() + 1);
        mFragmentManager
                .beginTransaction()
                .setCustomAnimations(R.anim.slide_in_right, R.anim.slide_out_left, R.anim.slide_in_left, R.anim.slide_out_right)
                .show(fragment)
                .replace(R.id.content_main, fragment, tag)
                .addToBackStack(null)
                .commit();

        if (mFragmentManager.getBackStackEntryCount() == 0) {
            mToolbar.setNavigationIcon(R.drawable.ic_back);
        }

        mToolbar.getMenu().clear();
        hideKeyboard();
    }

    public void popFragment() {
        mFragmentManager.popBackStack();
        if (mFragmentManager.getBackStackEntryCount() == 1) {
            mToolbar.setNavigationIcon(R.drawable.ic_menu);
        }
        hideKeyboard();
    }

    BaseFragment getCurrentFragment() {
        String tag = "" + mFragmentManager.getBackStackEntryCount();
        return (BaseFragment) mFragmentManager.findFragmentByTag(tag);
    }

    public Menu getToolbarMenu() {
        return mToolbar.getMenu();
    }

    public void reloadMenu() {
        Menu menu = mNavigationView.getMenu();
        menu.clear();

        boolean isJobSeeker = AppData.user.isJobSeeker() || (!AppData.user.isRecruiter() && getUserType() == AppData.JOBSEEKER);
        int[] data = isJobSeeker ? jobSeekerMenu : recruiterMenu;

        for (int id : data) {
            MenuItemInfo info = menuItemData[id];
            if (info != null) {
                MenuItem menuItem = menu.add(0, id, Menu.NONE, info.title);
                menuItem.setIcon(info.iconRes);
                if (isJobSeeker) {
                    if ((info.flags.contains("J") && AppData.user.getJob_seeker() == null) || (info.flags.contains("P") && !AppData.existProfile)) {
                        menuItem.setEnabled(false);
                    } else {
                        menuItem.setEnabled(true);
                    }
                } else {
                    if (info.flags.contains("B") && AppData.user.getBusinesses().size() == 0) {
                        menuItem.setEnabled(false);
                    } else {
                        menuItem.setEnabled(true);
                    }
                }
            }
        }
    }

    public void loggedin(int pageID) {
        mContentView.setBackgroundColor(0xFFFFFF);
        mCurrentPageID = -1;
        reloadMenu();
        setRootFragement(pageID);
    }

    public void logout() {
        Popup.showGreen("Are you sure you want to log out?", "Log Out", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                //MJPApi.shared().logout();
                MJPApi.shared().clearToken();
                AppData.clearData();

                mDrawer.closeDrawer(GravityCompat.START);
                mContentView.setBackgroundColor(getResources().getColor(R.color.colorPrimary));
                mCurrentPageID = -1;
                replaceFragment(new LoginFragment());
            }
        }, "Cancel", null, true);
    }

    public void hideKeyboard() {
        View view = getCurrentFocus();
        if (view != null) {
            InputMethodManager imm = (InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        getCurrentFragment().onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        getCurrentFragment().onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    @Override
    public void onBackPressed() {
        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        if (drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
        } else {
            if (mFragmentManager.getBackStackEntryCount() == 0) {
                if (AppData.user != null) {
                    logout();
                } else {
                    super.onBackPressed();
                }
            } else {
                popFragment();
            }
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {

        int id = item.getItemId();

        if (id == android.R.id.home) {
            if (mFragmentManager.getBackStackEntryCount() == 0) {
                mDrawer.openDrawer(GravityCompat.START);
                hideKeyboard();
            } else {
                popFragment();
            }
        } else {
            getCurrentFragment().onMenuSelected(id);
        }

        return super.onOptionsItemSelected(item);
    }

    @SuppressWarnings("StatementWithEmptyBody")
    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        // Handle navigation view item clicks here.

        int id = item.getItemId();
        if (mCurrentPageID != id) {
            if (id == AppData.PAGE_CONTACT_UP) {
                Intent emailIntent = new Intent(Intent.ACTION_SENDTO);
                emailIntent.setData(Uri.parse("mailto:support@myjobpitch.com"));
                startActivity(emailIntent);
                return false;
            }
            if (id == AppData.PAGE_LOGOUT) {
                logout();
                return false;
            }
            setRootFragement(id);
        }

        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }


    /************ sidebar menu item data ***********/

    public class MenuItemInfo {

        public int id;
        public String title;
        public int iconRes;
        public Class fragmentClass;
        public String flags;

        public MenuItemInfo(int id, String title, int iconRes, Class fragmentClass, String flags) {
            this.id = id;
            this.title = title;
            this.iconRes = iconRes;
            this.fragmentClass = fragmentClass;
            this.flags = flags;
        }

    }

    public MenuItemInfo getCurrentPageMenuInfo() {
        return menuItemData[mCurrentPageID];
    }

    MenuItemInfo[] menuItemData = {
            new MenuItemInfo(AppData.PAGE_FIND_JOB, "Find Job", R.drawable.menu_job_search, FindJobFragment.class, "P"),
            new MenuItemInfo(AppData.PAGE_JS_APPLICATIONS, "Applications", R.drawable.menu_application, TalentApplicationsFragment.class, "P"),
            new MenuItemInfo(AppData.PAGE_MESSAGES, "Messages", R.drawable.menu_message, MessageListFragment.class, "PB"),
            new MenuItemInfo(AppData.PAGE_JOB_PROFILE, "Job Profile", R.drawable.menu_job_profile, JobProfileFragment.class, "J"),
            new MenuItemInfo(AppData.PAGE_ADD_RECORD, "Record Pitch", R.drawable.menu_add_record, PitchFragment.class, "J"),
            new MenuItemInfo(AppData.PAGE_JOB_PROFILE, "Profile", R.drawable.menu_user_profile, TalentProfileFragment.class, ""),
            new MenuItemInfo(AppData.PAGE_FIND_TALENT, "Find Talent", R.drawable.menu_user_search, SelectJobFragment.class, "B"),
            new MenuItemInfo(AppData.PAGE_R_APPLICATIONS, "Applications", R.drawable.menu_application, SelectJobFragment.class, "B"),
            new MenuItemInfo(AppData.PAGE_CONNECTIONS, "Connections", R.drawable.menu_connect, SelectJobFragment.class, "B"),
            new MenuItemInfo(AppData.PAGE_MY_SHORTLIST, "My Shortlist", R.drawable.menu_shortlisted, SelectJobFragment.class, "B"),
            new MenuItemInfo(AppData.PAGE_ADD_JOB, "Add or Edit Jobs", R.drawable.menu_business, BusinessListFragment.class, ""),
            new MenuItemInfo(AppData.PAGE_PAYMENT, "Payment", R.drawable.menu_payment, PaymentFragment.class, ""),
            new MenuItemInfo(AppData.PAGE_CHANGE_PASS, "Change Password", R.drawable.menu_key, ChangePasswordFragment.class, ""),
            new MenuItemInfo(AppData.PAGE_HELP, "Help", R.drawable.menu_help, HelpFragment.class, ""),
            new MenuItemInfo(AppData.PAGE_LOGOUT, "Log Out", R.drawable.menu_logout, null, ""),
            new MenuItemInfo(AppData.PAGE_CONTACT_UP, "Contact Us", R.drawable.menu_contact_us, null, ""),
    };

    int[] jobSeekerMenu = {
            AppData.PAGE_FIND_JOB, AppData.PAGE_JS_APPLICATIONS, AppData.PAGE_MESSAGES, AppData.PAGE_JOB_PROFILE, AppData.PAGE_ADD_RECORD,
            AppData.PAGE_USER_PROFILE, AppData.PAGE_CHANGE_PASS, AppData.PAGE_HELP, AppData.PAGE_CONTACT_UP, AppData.PAGE_LOGOUT
    };

    int[] recruiterMenu = {
            AppData.PAGE_FIND_TALENT, AppData.PAGE_R_APPLICATIONS, AppData.PAGE_CONNECTIONS, AppData.PAGE_MY_SHORTLIST, AppData.PAGE_MESSAGES,
            AppData.PAGE_ADD_JOB, AppData.PAGE_PAYMENT, AppData.PAGE_CHANGE_PASS, AppData.PAGE_HELP, AppData.PAGE_CONTACT_UP, AppData.PAGE_LOGOUT
    };

    /************ Shared Preferences ***********/

    public String getEmail() {
        return getSharedPreferences("LoginPreferences", MODE_PRIVATE).getString("email", "");
    }

    public String getPassword() {
        return getSharedPreferences("LoginPreferences", MODE_PRIVATE).getString("password", "");
    }

    public boolean getRemember() {
        return getSharedPreferences("LoginPreferences", MODE_PRIVATE).getBoolean("remember", false);
    }

    public int getUserType() {
        return getSharedPreferences("LoginPreferences", MODE_PRIVATE).getInt("usermode", 0);
    }

    public void saveLoginInfo(String email, String password, boolean remember) {
        getSharedPreferences("LoginPreferences", MODE_PRIVATE).edit()
                .putString("email", email)
                .putString("password", password)
                .putBoolean("remember", remember)
                .commit();
    }

    public void saveUserType(int usertype) {
        getSharedPreferences("LoginPreferences", MODE_PRIVATE).edit()
                .putInt("usermode", usertype)
                .commit();
    }

}