package com.myjobpitch;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.provider.MediaStore;
import android.support.design.widget.NavigationView;
import android.support.v4.app.ActivityCompat;
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
import com.fasterxml.jackson.databind.JsonNode;
import com.github.rubensousa.bottomsheetbuilder.BottomSheetBuilder;
import com.github.rubensousa.bottomsheetbuilder.adapter.BottomSheetItemClickListener;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.Message;
import com.myjobpitch.fragments.BaseFragment;
import com.myjobpitch.fragments.BusinessListFragment;
import com.myjobpitch.fragments.ChangePasswordFragment;
import com.myjobpitch.fragments.FindJobFragment;
import com.myjobpitch.fragments.HelpFragment;
import com.myjobpitch.fragments.InterviewsFragment;
import com.myjobpitch.fragments.JobProfileFragment;
import com.myjobpitch.fragments.TalentApplicationsFragment;
import com.myjobpitch.fragments.TalentDetailFragment;
import com.myjobpitch.fragments.TalentProfileFragment;
import com.myjobpitch.fragments.LoginFragment;
import com.myjobpitch.fragments.MessageListFragment;
import com.myjobpitch.fragments.PaymentFragment;
import com.myjobpitch.fragments.PitchFragment;
import com.myjobpitch.fragments.SelectJobFragment;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.views.Popup;
import com.nostra13.universalimageloader.core.ImageLoader;
import com.nostra13.universalimageloader.core.ImageLoaderConfiguration;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;

public class MainActivity extends AppCompatActivity
        implements NavigationView.OnNavigationItemSelectedListener {

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

    private static final int PERMISSION_IAMGE_CAPTURE = 11000;
    private static final int PERMISSION_WRITE_EXTERNAL_STORAGE1 = 11001;
    private static final int PERMISSION_WRITE_EXTERNAL_STORAGE2 = 11002;    // only image

    private static MainActivity instance;

    public static MainActivity shared() {
        return instance;
    }

    Handler timerHandler = new Handler();
    public long newMessageCount = 0;
    public List <Application>  applications;
    public List <Message> newMessages;
    public Message startMessage;
    public Message lastMessage;
    public Boolean refresh = true;

    Runnable timerRunnable = new Runnable() {
        @Override
        public void run() {

            if (refresh && AppData.getUserType() != 0) {

                new APITask(new APIAction() {
                    @Override
                    public void run() throws MJPApiException {
                        String query = null;
                        applications = MJPApi.shared().get(Application.class, query);

                    }
                }).addListener(new APITaskListener() {
                    @Override
                    public void onSuccess() {

                        newMessages = new ArrayList<Message>();
                        Integer from_role = AppData.user.isJobSeeker() ? AppData.JOBSEEKER : AppData.RECRUITER;

                        for (Application application: applications) {

                            List<Message> messages = application.getMessages();
                            if (messages.size() > 0) {

                                for (int j = messages.size() - 1; j >= 0; j--) {
                                    if (messages.get(j).getFrom_role() == from_role) {
                                        if (!messages.get(j).getRead()) {
                                            // New Message
                                            newMessages.add(messages.get(j));
                                        } else {
                                            // find start Message
                                            if (startMessage == null) {
                                                startMessage = messages.get(j);
                                            } else {
                                                if (startMessage.getCreated().compareTo(messages.get(j).getCreated()) < 0) {
                                                    startMessage = messages.get(j);
                                                }
                                            }
                                            break;
                                        }
                                    }
                                }
                            }

                        }

                        newMessageCount = startMessage == null ? newMessages.size() : 0;
                        if (newMessages.size() > 0) {
                            for (int i = 0; i < newMessages.size() - 1; i++) {
                                if (startMessage != null) {
                                    if (startMessage.getCreated().compareTo(newMessages.get(i).getCreated()) < 0) {
                                        newMessageCount++;
                                        if (lastMessage == null) {
                                            lastMessage = newMessages.get(i);
                                        } else {
                                            if (lastMessage.getCreated().compareTo(newMessages.get(i).getCreated()) < 0) {
                                                lastMessage = newMessages.get(i);
                                            }
                                        }
                                    }
                                } else {
                                    if (lastMessage == null) {
                                        lastMessage = newMessages.get(i);
                                    } else {
                                        if (lastMessage.getCreated().compareTo(newMessages.get(i).getCreated()) < 0) {
                                            lastMessage = newMessages.get(i);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    @Override
                    public void onError(JsonNode errors) {

                    }
                }).execute();
            }

            timerHandler.postDelayed(this, 30000);
        }
    };

    public  void isRefresh(Boolean isRefresh) {
        refresh = isRefresh;
    }

    public void errorHandler(JsonNode errors) {

        if (errors == null) {
            Popup popup = new Popup(null, "Connection Error", true);
            popup.addGreyButton("Ok", null);
            popup.show();
        }
    }

    Handler indicationHandler = new Handler();

    Runnable indicationTimerRunnable = new Runnable() {
        @Override
        public void run() {
            reloadMenu();
            indicationHandler.postDelayed(this, 10000);
        }
    };

    public void startChecking() {
        indicationHandler.postDelayed(indicationTimerRunnable, 0);
    }

    public  void stopChecking() {
        indicationHandler.removeCallbacks(indicationTimerRunnable);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);
        ButterKnife.bind(this);

        mDrawer.setDrawerLockMode(DrawerLayout.LOCK_MODE_LOCKED_CLOSED);
        mNavigationView.setNavigationItemSelectedListener(this);
        mToolbar.setNavigationIcon(R.drawable.ic_menu);
        setSupportActionBar(mToolbar);

        instance = this;


        // image loaders
        Fresco.initialize(getApplicationContext());
        ImageLoaderConfiguration config = new ImageLoaderConfiguration.Builder(this).build();
        ImageLoader.getInstance().init(config);

        mFragmentManager = getSupportFragmentManager();
        replaceFragment(new LoginFragment());
    }

    public void startNewMessageCount() {
        timerHandler.postDelayed(timerRunnable, 0);
    }

    public  void stopNewMessageCount() {
        timerHandler.removeCallbacks(timerRunnable);
    }

    public int getCurrentPageID() {
        return mCurrentPageID;
    }

    public void setRootFragement(int pageID) {

        if (mCurrentPageID == -1) {
            mContentView.setBackgroundColor(0xFFFFFF);
        }

        // remove all fragments

        while (mFragmentManager.getBackStackEntryCount() > 0) {
            mFragmentManager.popBackStackImmediate();
        }

        // new fragment

        int pid = pageID == AppData.PAGE_VIEW_PROFILE && AppData.user.getJob_seeker() == null ? AppData.PAGE_USER_PROFILE : pageID;
        MenuItemInfo info = menuItemData[pid];

        try {
            BaseFragment fragment = (BaseFragment) info.fragmentClass.newInstance();
            fragment.title = info.title;
            replaceFragment(fragment);
        } catch (Exception e) {

        }

        // update sidemenu item

        Menu menu = mNavigationView.getMenu();

        if (mCurrentPageID != -1) {
            menu.findItem(mCurrentPageID).setChecked(false);
        }
        mCurrentPageID = pageID;

        menu.findItem(mCurrentPageID).setChecked(true);

        // update toolbar

        mToolbar.setNavigationIcon(R.drawable.ic_menu);

    }

    public void replaceFragment(BaseFragment fragment) {
        String tag = "" + (mFragmentManager.getBackStackEntryCount());

        mFragmentManager
                .beginTransaction()
                .replace(R.id.content_main, fragment, tag)
                .setTransition(FragmentTransaction.TRANSIT_FRAGMENT_FADE)
                .commit();

        mToolbar.getMenu().clear();
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
    }

    public void popFragment() {
        mFragmentManager.popBackStack();

        if (mFragmentManager.getBackStackEntryCount() == 1) {
            mToolbar.setNavigationIcon(R.drawable.ic_menu);
        }

        mToolbar.getMenu().clear();
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

        boolean isJobSeeker = AppData.user.isJobSeeker() || (!AppData.user.isRecruiter() && AppData.getUserType() == AppData.JOBSEEKER);
        int[] data = isJobSeeker ? jobSeekerMenu : recruiterMenu;

        for (int id : data) {
            MenuItemInfo info = menuItemData[id];
            if (info != null) {
                MenuItem menuItem = menu.add(0, id, Menu.NONE, info.title);
                if (id != AppData.PAGE_MESSAGES) {
                    menuItem.setIcon(info.iconRes);
                } else {
                    int newIconRes = R.drawable.menu_message;
                    if (newMessageCount > 0 && newMessageCount < 10) {
                        newIconRes = getResources().getIdentifier("com.myjobpitch:drawable/menu_message" + newMessageCount,null, null);
                    } else if (newMessageCount >= 10) {
                        newIconRes = R.drawable.menu_message10;
                    }
                    menuItem.setIcon(newIconRes);
                }
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

    public void logout() {
        Popup popup = new Popup(this, "Are you sure you want to log out?", true);
        popup.addGreenButton("Log Out", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                stopNewMessageCount();
                stopChecking();
                //MJPApi.shared().logout();
                MJPApi.shared().clearToken();
                AppData.clearData();

                mDrawer.closeDrawer(GravityCompat.START);

                mContentView.setBackgroundColor(getResources().getColor(R.color.colorPrimary));

                mNavigationView.getMenu().clear();
                mCurrentPageID = -1;

                replaceFragment(new LoginFragment());
            }
        });
        popup.addGreyButton("Cancel", null);
        popup.show();
    }

    public void hideKeyboard() {
        if (getCurrentFocus() != null) {
            InputMethodManager imm = (InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(getCurrentFocus().getWindowToken(), 0);
        }
    }

    public void showFilePicker(final boolean onlyImage) {
        new BottomSheetBuilder(this)
                .setMode(BottomSheetBuilder.MODE_LIST)
                .addTitleItem("Select")
                .addItem(0, "Image Capture", R.drawable.ic_camera)
                .addItem(1, "Local Storage", R.drawable.ic_loca_storage)
                .addDividerItem()
                .addItem(2, "Google Drive", R.drawable.ic_google_drive)
                .addItem(3, "Dropbox", R.drawable.ic_dropbox)
                .expandOnStart(true)
                .setItemClickListener(new BottomSheetItemClickListener() {
                    @Override
                    public void onBottomSheetItemClick(MenuItem item) {
                        switch (item.getItemId()) {
                            case 0: {
                                final String[] permissions = {
                                        android.Manifest.permission.CAMERA,
                                        android.Manifest.permission.WRITE_EXTERNAL_STORAGE};
                                final List<String> permissionsToRequest = new ArrayList<>();
                                for (String permission : permissions) {
                                    if (ActivityCompat.checkSelfPermission(MainActivity.this, permission) != PackageManager.PERMISSION_GRANTED) {
                                        permissionsToRequest.add(permission);
                                    }
                                }
                                if (!permissionsToRequest.isEmpty()) {
                                    ActivityCompat.requestPermissions(MainActivity.this, permissionsToRequest.toArray(new String[permissionsToRequest.size()]), PERMISSION_IAMGE_CAPTURE);
                                } else {
                                    actionImageCapture();
                                }
                                break;
                            }
                            case 1: {
                                if (ActivityCompat.checkSelfPermission(MainActivity.this, android.Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                                    String[] permissions = {android.Manifest.permission.WRITE_EXTERNAL_STORAGE};
                                    ActivityCompat.requestPermissions(MainActivity.this, permissions,
                                            onlyImage ? PERMISSION_WRITE_EXTERNAL_STORAGE2 : PERMISSION_WRITE_EXTERNAL_STORAGE1);
                                } else {
                                    actionPick(onlyImage);
                                }
                                break;
                            }
                            case 2: {
                                Intent intent = new Intent(MainActivity.this, GoogleDriveActivity.class);
                                intent.putExtra("onlyImage", onlyImage);
                                startActivityForResult(intent, AppData.REQUEST_GOOGLE_DRIVE);
                                break;
                            }
                            case 3: {
                                Intent intent = new Intent(MainActivity.this, DropboxActivity.class);
                                intent.putExtra("onlyImage", onlyImage);
                                startActivityForResult(intent, AppData.REQUEST_DROPBOX);
                                break;
                            }
                        }
                    }
                })
                .createDialog()
                .show();
    }

    void actionPick(boolean onlyImage) {
        Intent intent = new Intent(Intent.ACTION_PICK);
        intent.setType(onlyImage ? "image/*" : "image/*");
        startActivityForResult(intent, AppData.REQUEST_IMAGE_PICK);
    }

    void actionImageCapture() {
        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        startActivityForResult(takePictureIntent, AppData.REQUEST_IMAGE_CAPTURE);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        for (int permission : grantResults) {
            if (permission != PackageManager.PERMISSION_GRANTED) {
                return;
            }
        }
        if (requestCode == PERMISSION_IAMGE_CAPTURE) {
            actionImageCapture();
        } else if (requestCode == PERMISSION_WRITE_EXTERNAL_STORAGE1 || requestCode == PERMISSION_WRITE_EXTERNAL_STORAGE2) {
            actionPick(requestCode == PERMISSION_WRITE_EXTERNAL_STORAGE2);
        } else {
            getCurrentFragment().onRequestPermissionsResult(requestCode, permissions, grantResults);
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        getCurrentFragment().onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        if (drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
        } else {
            if (mFragmentManager.getBackStackEntryCount() == 0) {
                if (AppData.user != null) {
                    if (mCurrentPageID == AppData.PAGE_ADD_RECORD || mCurrentPageID == AppData.PAGE_JOB_PROFILE || mCurrentPageID == AppData.PAGE_CHANGE_PASS) {
                        setRootFragement(AppData.PAGE_FIND_JOB);
                    } else {
                        logout();
                    }
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
        int id = item.getItemId();
        if (mCurrentPageID != id) {
            if (id == AppData.PAGE_SHARE) {
                String link = AppData.user.isRecruiter() ? "https://www.myjobpitch.com/recruiters/" : "https://www.myjobpitch.com/candidates/";
                Intent sharingIntent = new Intent(Intent.ACTION_SEND);
                sharingIntent.setType("text/html");
                sharingIntent.putExtra(android.content.Intent.EXTRA_TEXT, link);
                startActivity(Intent.createChooser(sharingIntent,"Share using"));
                return false;
            }
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
        new MenuItemInfo(AppData.PAGE_FIND_JOB, "Find Job", R.drawable.menu_search, FindJobFragment.class, "P"),
        new MenuItemInfo(AppData.PAGE_JS_APPLICATIONS, "Applications", R.drawable.menu_application, TalentApplicationsFragment.class, "P"),
        new MenuItemInfo(AppData.PAGE_MESSAGES, "Messages", R.drawable.menu_message, MessageListFragment.class, "PB"),
        new MenuItemInfo(AppData.PAGE_JOB_PROFILE, "Job Profile", R.drawable.menu_job_profile, JobProfileFragment.class, "J"),
        new MenuItemInfo(AppData.PAGE_ADD_RECORD, "Record Pitch", R.drawable.menu_add_record, PitchFragment.class, "J"),
        new MenuItemInfo(AppData.PAGE_VIEW_PROFILE, "Profile", R.drawable.menu_user_profile, TalentDetailFragment.class, ""),
        new MenuItemInfo(AppData.PAGE_USER_PROFILE, "Profile", R.drawable.menu_user_profile, TalentProfileFragment.class, ""),
        new MenuItemInfo(AppData.PAGE_FIND_TALENT, "Find Talent", R.drawable.menu_search, SelectJobFragment.class, "B"),
        new MenuItemInfo(AppData.PAGE_R_APPLICATIONS, "Applications", R.drawable.menu_application, SelectJobFragment.class, "B"),
        new MenuItemInfo(AppData.PAGE_CONNECTIONS, "Connections", R.drawable.menu_connect, SelectJobFragment.class, "B"),
        new MenuItemInfo(AppData.PAGE_MY_SHORTLIST, "My Shortlist", R.drawable.menu_shortlisted, SelectJobFragment.class, "B"),
        new MenuItemInfo(AppData.PAGE_ADD_JOB, "Add or Edit Jobs", R.drawable.menu_business, BusinessListFragment.class, ""),
        new MenuItemInfo(AppData.PAGE_PAYMENT, "Payment", R.drawable.menu_payment, PaymentFragment.class, ""),
        new MenuItemInfo(AppData.PAGE_CHANGE_PASS, "Change Password", R.drawable.menu_key, ChangePasswordFragment.class, ""),
        new MenuItemInfo(AppData.PAGE_HELP, "Help", R.drawable.menu_help, HelpFragment.class, ""),
        new MenuItemInfo(AppData.PAGE_LOGOUT, "Log Out", R.drawable.menu_logout, null, ""),
        new MenuItemInfo(AppData.PAGE_CONTACT_UP, "Contact Us", R.drawable.menu_contact_us, null, ""),
        new MenuItemInfo(AppData.PAGE_SHARE, "Tell a friend", R.drawable.menu_share, null, ""),
        new MenuItemInfo(AppData.PAGE_USERS, "Users", R.drawable.menu_user_profile, BusinessListFragment.class, ""),
        new MenuItemInfo(AppData.PAGE_R_INTERVIEWS, "Interviews", R.drawable.menu_connect, SelectJobFragment.class, "B"),
        new MenuItemInfo(AppData.PAGE_JS_INTERVIEWS, "Interviews", R.drawable.menu_connect, InterviewsFragment.class, "P"),
    };

    int[] jobSeekerMenu = {
            AppData.PAGE_FIND_JOB, AppData.PAGE_JS_APPLICATIONS, AppData.PAGE_MESSAGES, AppData.PAGE_JS_INTERVIEWS, AppData.PAGE_JOB_PROFILE, AppData.PAGE_ADD_RECORD,
            AppData.PAGE_VIEW_PROFILE, AppData.PAGE_CHANGE_PASS, AppData.PAGE_HELP, AppData.PAGE_SHARE, AppData.PAGE_CONTACT_UP, AppData.PAGE_LOGOUT
    };

    int[] recruiterMenu = {
            AppData.PAGE_FIND_TALENT, AppData.PAGE_R_APPLICATIONS, AppData.PAGE_CONNECTIONS, AppData.PAGE_MY_SHORTLIST, AppData.PAGE_MESSAGES, AppData.PAGE_R_INTERVIEWS,
            AppData.PAGE_ADD_JOB, AppData.PAGE_PAYMENT, AppData.PAGE_CHANGE_PASS, AppData.PAGE_USERS, AppData.PAGE_HELP, AppData.PAGE_SHARE, AppData.PAGE_CONTACT_UP, AppData.PAGE_LOGOUT
    };

}
