package com.myjobpitch;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.support.annotation.NonNull;
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
import android.widget.ImageView;
import android.widget.TextView;

import com.facebook.drawee.backends.pipeline.Fresco;
import com.github.rubensousa.bottomsheetbuilder.BottomSheetBuilder;
import com.myjobpitch.activities.DropboxActivity;
import com.myjobpitch.activities.GoogleDriveActivity;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Image;
import com.myjobpitch.api.data.Role;
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
import com.myjobpitch.pages.employees.EmployeeListFragment;
import com.myjobpitch.pages.hr.employees.HREmployeeListFragment;
import com.myjobpitch.pages.hr.jobs.HRJobListFragment;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;
import com.nostra13.universalimageloader.core.ImageLoader;
import com.nostra13.universalimageloader.core.ImageLoaderConfiguration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import butterknife.BindView;
import butterknife.ButterKnife;

public class MainActivity extends AppCompatActivity {

    @BindView(R.id.drawer_layout)
    DrawerLayout mDrawer;

    @BindView(R.id.nav_view)
    NavigationView mNavigationView;

    @BindView(R.id.toolbar)
    Toolbar mToolbar;

    @BindView(R.id.content_main)
    ViewGroup mContentView;

    FragmentManager mFragmentManager;

    int mCurrentMenuID = -1;

    private static final int PERMISSION_IAMGE_CAPTURE = 11000;
    private static final int PERMISSION_WRITE_EXTERNAL_STORAGE1 = 11001;
    private static final int PERMISSION_WRITE_EXTERNAL_STORAGE2 = 11002;    // only image

    private static MainActivity instance;

    public static MainActivity shared() {
        return instance;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);
        ButterKnife.bind(this);

        instance = this;

        mDrawer.setDrawerLockMode(DrawerLayout.LOCK_MODE_LOCKED_CLOSED);
        setSupportActionBar(mToolbar);

        mFragmentManager = getSupportFragmentManager();
        setRootFragement(-1);

        mDrawer.addDrawerListener(new DrawerLayout.DrawerListener() {
            @Override
            public void onDrawerSlide(@NonNull View drawerView, float slideOffset) {
            }

            @Override
            public void onDrawerOpened(@NonNull View drawerView) {
            }

            @Override
            public void onDrawerClosed(@NonNull View drawerView) {
            }

            @Override
            public void onDrawerStateChanged(int newState) {
                if (newState == 2 && !mDrawer.isDrawerOpen(GravityCompat.START)) {

                    ImageView profileView = mNavigationView.getHeaderView(0).findViewById(R.id.user_profile);
                    TextView nameView = mNavigationView.getHeaderView(0).findViewById(R.id.user_name);
                    TextView emailView = mNavigationView.getHeaderView(0).findViewById(R.id.user_email);

                    emailView.setText(AppData.getEmail());

                    boolean hr_access = false;

                    if (AppData.userRole == Role.JOB_SEEKER_ID) {
                        if (AppData.jobSeeker != null) {
                            AppHelper.loadJobSeekerImage(AppData.jobSeeker, profileView);
                            nameView.setText(AppHelper.getJobSeekerName(AppData.jobSeeker));
                        } else {
                            profileView.setImageResource(R.drawable.avatar);
                        }

                    } else {
                        Image logo = null;
                        if (AppData.businesses.size() > 0) {
                            Business business = AppData.businesses.get(0);
                            logo = AppHelper.getBusinessLogo(business);
                            nameView.setText(business.getName());
                        }
                        if (logo != null) {
                            AppHelper.loadImage(logo.getThumbnail(), profileView);
                        } else {
                            profileView.setImageResource(R.drawable.default_logo);
                        }

                        for (Business item : AppData.businesses) {
                            if (item.getHr_access()) {
                                hr_access = true;
                                break;
                            }
                        }
                    }

                    Menu menu = mNavigationView.getMenu();

                    for (Integer key : menuItemData.keySet()) {
                        MenuItem item = menu.findItem(key);
                        MenuItemInfo info = menuItemData.get(key);

                        if (AppData.userRole == Role.JOB_SEEKER_ID) {
                            if (info.flags.contains("J")) {
                                boolean f = (info.flags.contains("1") && AppData.user.getJob_seeker() == null) || (info.flags.contains("2") && AppData.profile == null);
                                item.setEnabled(!f);
                                item.setVisible(true);
                            } else {
                                item.setVisible(false);
                            }
                        } else {
                            if (info.flags.contains("R")) {
                                boolean f = info.flags.contains("1") && AppData.user.getBusinesses().size() == 0;
                                item.setEnabled(!f);
                                item.setVisible(true);
                            } else {
                                item.setVisible(false);
                            }
                        }
                    }
                    menu.findItem(R.id.menu_hr_jobs).setVisible(hr_access);
                    menu.findItem(R.id.menu_hr_employees).setVisible(hr_access);
                    menu.findItem(R.id.menu_employees).setVisible(AppData.user.getEmployees().size() > 0);

                    int msgCount = AppData.newMessageCount;
                    TextView badgeLabel = menu.findItem(R.id.menu_messages).getActionView().findViewById(R.id.badge_label);
                    badgeLabel.setVisibility(msgCount == 0 ? View.INVISIBLE : View.VISIBLE);
                    badgeLabel.setText(msgCount > 9 ? "9+" : String.valueOf(msgCount));

                    if (mCurrentMenuID != -1) {
                        menu.findItem(mCurrentMenuID).setChecked(true);
                    }
                }
            }
        });

        mNavigationView.setNavigationItemSelectedListener(item -> {
            int menuId = item.getItemId();
            if (mCurrentMenuID != menuId) {
                if (menuId == R.id.menu_share) {
                    String link = AppData.user.isRecruiter() ? "https://www.myjobpitch.com/recruiters/" : "https://www.myjobpitch.com/candidates/";
                    Intent sharingIntent = new Intent(Intent.ACTION_SEND);
                    sharingIntent.setType("text/html");
                    sharingIntent.putExtra(Intent.EXTRA_TEXT, link);
                    startActivity(Intent.createChooser(sharingIntent,getString(R.string.share_using)));
                    return false;
                }

                if (menuId == R.id.menu_contact_us) {
                    Intent emailIntent = new Intent(Intent.ACTION_SENDTO);
                    emailIntent.setData(Uri.parse("mailto:support@myjobpitch.com"));
                    startActivity(emailIntent);
                    return false;
                }

                if (menuId == R.id.menu_logout) {
                    logout();
                    return false;
                }

                setRootFragement(menuId);
            }

            mDrawer.closeDrawer(GravityCompat.START);
            return true;
        });

        // image loaders
        Fresco.initialize(getApplicationContext());
        ImageLoaderConfiguration config = new ImageLoaderConfiguration.Builder(this).build();
        ImageLoader.getInstance().init(config);

//        Intent appLinkIntent = getIntent();
//        String appLinkAction = appLinkIntent.getAction();
//        Uri appLinkData = appLinkIntent.getData();
    }

    public Menu getToolbarMenu() {
        return mToolbar.getMenu();
    }

    public int getCurrentMenuID() {
        return mCurrentMenuID;
    }

    public MenuItem getCurrentMenu() {
        return mNavigationView.getMenu().findItem(mCurrentMenuID);
    }

    public void setRootFragement(int menuId) {
        mCurrentMenuID = menuId;

        // remove all fragments

        while (mFragmentManager.getBackStackEntryCount() > 0) {
            mFragmentManager.popBackStackImmediate();
        }

        // new fragment

        try {
            if (mCurrentMenuID == -1) {
                replaceFragment(new LoginFragment());
            } else {
                MenuItemInfo info = menuItemData.get(mCurrentMenuID);
                Class fragmentClass = info.fragmentClass;
                if (menuId == R.id.menu_user_profile && AppData.user.getJob_seeker() == null) {
                    fragmentClass = TalentProfileFragment.class;
                }

                BaseFragment fragment = (BaseFragment) fragmentClass.newInstance();
                fragment.title = mNavigationView.getMenu().findItem(menuId).getTitle().toString();
                replaceFragment(fragment);
            }
        } catch (Exception e) {
        }

        // update toolbar

        mToolbar.setNavigationIcon(R.drawable.ic_menu);
    }

    public void replaceFragment(BaseFragment fragment) {
        String tag = String.valueOf(mFragmentManager.getBackStackEntryCount());
        mFragmentManager
                .beginTransaction()
                .replace(R.id.content_main, fragment, tag)
                .setTransition(FragmentTransaction.TRANSIT_FRAGMENT_FADE)
                .commit();

        getToolbarMenu().clear();
    }

    public void pushFragment(BaseFragment fragment) {
        String tag = String.valueOf(mFragmentManager.getBackStackEntryCount() + 1);
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

        getToolbarMenu().clear();
    }

    public void popFragment() {
        mFragmentManager.popBackStack();

        if (mFragmentManager.getBackStackEntryCount() == 1) {
            mToolbar.setNavigationIcon(R.drawable.ic_menu);
        }

        getToolbarMenu().clear();
    }

    BaseFragment getCurrentFragment() {
        String tag = String.valueOf(mFragmentManager.getBackStackEntryCount());
        return (BaseFragment) mFragmentManager.findFragmentByTag(tag);
    }

    public void logout() {
        Popup popup = new Popup(this, R.string.logout_message, true);
        popup.addGreenButton(getString(R.string.logout), view -> {
            setRootFragement(-1);
            mDrawer.closeDrawer(GravityCompat.START);
        });
        popup.addGreyButton(R.string.cancel, null);
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
                .addTitleItem(R.string.select)
                .addItem(0, R.string.image_capture, R.drawable.ic_camera)
                .addItem(1, R.string.local_storage, R.drawable.ic_loca_storage)
                .addDividerItem()
                .addItem(2, R.string.google_drive, R.drawable.ic_google_drive)
                .addItem(3, R.string.dropbox, R.drawable.ic_dropbox)
                .expandOnStart(true)
                .setItemClickListener(item -> {
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
        if (mDrawer.isDrawerOpen(GravityCompat.START)) {
            mDrawer.closeDrawer(GravityCompat.START);
        } else {
            if (mFragmentManager.getBackStackEntryCount() == 0) {
                if (AppData.user != null) {
                    if (mCurrentMenuID == R.id.menu_record || mCurrentMenuID == R.id.menu_job_profile || mCurrentMenuID == R.id.menu_change_pass) {
                        setRootFragement(R.id.menu_find_job);
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

        int menuId = item.getItemId();

        if (menuId == android.R.id.home) {
            if (mFragmentManager.getBackStackEntryCount() == 0) {
                mDrawer.openDrawer(GravityCompat.START);
                hideKeyboard();
            } else {
                popFragment();
            }
        } else {
            getCurrentFragment().onMenuSelected(menuId);
        }

        return super.onOptionsItemSelected(item);
    }

    /************ sidebar menu item data ***********/

    class MenuItemInfo {
        public Class fragmentClass;
        public String flags;

        public MenuItemInfo(Class fragmentClass, String flags) {
            this.fragmentClass = fragmentClass;
            this.flags = flags;
        }
    }

    Map<Integer, MenuItemInfo> menuItemData = new HashMap<Integer, MenuItemInfo>() {{
        put(R.id.menu_find_job, new MenuItemInfo(FindJobFragment.class, "J2"));
        put(R.id.menu_js_applications, new MenuItemInfo(TalentApplicationsFragment.class, "J2"));
        put(R.id.menu_js_interview, new MenuItemInfo(InterviewsFragment.class, "J2"));
        put(R.id.menu_job_profile, new MenuItemInfo(JobProfileFragment.class, "J1"));
        put(R.id.menu_record, new MenuItemInfo(PitchFragment.class, "J1"));
        put(R.id.menu_user_profile, new MenuItemInfo(TalentDetailFragment.class, "J"));

        put(R.id.menu_find_talent, new MenuItemInfo(SelectJobFragment.class, "R1"));
        put(R.id.menu_applications, new MenuItemInfo(SelectJobFragment.class, "R1"));
        put(R.id.menu_connections, new MenuItemInfo(SelectJobFragment.class, "R1"));
        put(R.id.menu_shortlist, new MenuItemInfo(SelectJobFragment.class, "R1"));
        put(R.id.menu_rc_interview, new MenuItemInfo(SelectJobFragment.class, "R1"));
        put(R.id.menu_business, new MenuItemInfo(BusinessListFragment.class, "R"));
        put(R.id.menu_users, new MenuItemInfo(BusinessListFragment.class, "R"));
        put(R.id.menu_payment, new MenuItemInfo(PaymentFragment.class, "R"));

        put(R.id.menu_messages, new MenuItemInfo(MessageListFragment.class, "JR12"));
        put(R.id.menu_change_pass, new MenuItemInfo(ChangePasswordFragment.class, "JR"));
        put(R.id.menu_help, new MenuItemInfo(HelpFragment.class, "JR"));
        put(R.id.menu_share, new MenuItemInfo(null, "JR"));
        put(R.id.menu_contact_us, new MenuItemInfo(null, "JR"));
        put(R.id.menu_logout, new MenuItemInfo(null, "JR"));

        put(R.id.menu_hr_jobs, new MenuItemInfo(HRJobListFragment.class, "JR"));
        put(R.id.menu_hr_employees, new MenuItemInfo(HREmployeeListFragment.class, "JR"));
        put(R.id.menu_employees, new MenuItemInfo(EmployeeListFragment.class, "JR"));
    }};
}
