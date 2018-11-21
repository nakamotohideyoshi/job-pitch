package com.myjobpitch.pages;

import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.design.widget.NavigationView;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.widget.Toolbar;
import android.view.Menu;
import android.view.MenuItem;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.facebook.drawee.backends.pipeline.Fresco;
import com.github.rubensousa.bottomsheetbuilder.BottomSheetBuilder;
import com.myjobpitch.R;
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
import com.myjobpitch.fragments.MessageListFragment;
import com.myjobpitch.fragments.PaymentFragment;
import com.myjobpitch.fragments.PitchFragment;
import com.myjobpitch.fragments.SelectJobFragment;
import com.myjobpitch.fragments.TalentApplicationsFragment;
import com.myjobpitch.fragments.TalentDetailsFragment;
import com.myjobpitch.pages.employees.EmployeeListFragment;
import com.myjobpitch.pages.hr.HRFragment;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.nostra13.universalimageloader.core.ImageLoader;
import com.nostra13.universalimageloader.core.ImageLoaderConfiguration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import butterknife.BindView;
import butterknife.ButterKnife;

public class MainActivity extends FormActivity implements NavigationView.OnNavigationItemSelectedListener {

    @BindView(R.id.drawer_layout)
    DrawerLayout mDrawer;

    @BindView(R.id.nav_view)
    NavigationView mNavView;

    @BindView(R.id.toolbar)
    Toolbar mToolbar;

    @BindView(R.id.content_main)
    ViewGroup mContentView;

    FragmentManager mFragmentManager;

    int mCurrentMenuID = -1;

    private static final int PERMISSION_IAMGE_CAPTURE = 11000;
    private static final int PERMISSION_WRITE_EXTERNAL_STORAGE1 = 11001;
    private static final int PERMISSION_WRITE_EXTERNAL_STORAGE2 = 11002;    // only image

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ButterKnife.bind(this);

        Fresco.initialize(getApplicationContext());
        ImageLoaderConfiguration config = new ImageLoaderConfiguration.Builder(this).build();
        ImageLoader.getInstance().init(config);

        mFragmentManager = getSupportFragmentManager();

        setSupportActionBar(mToolbar);

        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(this, mDrawer, mToolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        mDrawer.addDrawerListener(toggle);
        toggle.syncState();

        mNavView.setNavigationItemSelectedListener(this);

        ImageView avatarView = mNavView.getHeaderView(0).findViewById(R.id.user_avatar);
        TextView nameView = mNavView.getHeaderView(0).findViewById(R.id.user_name);
        TextView emailView = mNavView.getHeaderView(0).findViewById(R.id.user_email);

        emailView.setText(loadData(AppData.KEY_EMAIL));

        if (AppData.userRole == Role.JOB_SEEKER_ID) {

            mNavView.getMenu().setGroupVisible(R.id.recruiter_menus, false);

            AppHelper.loadJobseekerImage(AppData.jobseeker, avatarView);

            nameView.setText(AppHelper.getJobseekerName(AppData.jobseeker));

            setRootFragement(R.id.menu_js_find);
        } else {

            mNavView.getMenu().setGroupVisible(R.id.jobseeker_menus, false);

            Business business = AppData.businesses.get(0);
            Image logo = AppHelper.getBusinessLogo(business);
            if (logo != null) {
                AppHelper.loadImage(logo.getThumbnail(), avatarView);
            } else {
                avatarView.setImageResource(R.drawable.default_logo);
            }

            nameView.setText(AppData.businesses.get(0).getName());

            setRootFragement(R.id.menu_rc_find);
        }
    }

    public Menu getToolbarMenu() {
        return mToolbar.getMenu();
    }

    public int getCurrentMenuID() {
        return mCurrentMenuID;
    }

    public MenuItem getCurrentMenu() {
        return mNavView.getMenu().findItem(mCurrentMenuID);
    }

    public void setRootFragement(int id) {
        mCurrentMenuID = id;

        // remove all fragments

        while (mFragmentManager.getBackStackEntryCount() > 0) {
            mFragmentManager.popBackStackImmediate();
        }

        // new fragment

        try {
            Class fragmentClass = menuItemData.get(mCurrentMenuID);
//            if (id == R.id.menu_user_profile && AppData.user.getJob_seeker() == null) {
//                fragmentClass = TalentProfileFragment.class;
//            }
            BaseFragment fragment = (BaseFragment) fragmentClass.newInstance();
            fragment.title = mNavView.getMenu().findItem(id).getTitle().toString();
            replaceFragment(fragment);
        } catch (Exception e) {
        }

        // update toolbar

//        mToolbar.setNavigationIcon(R.drawable.ic_menu);
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

    void logout() {
        new AlertDialog.Builder(this)
                .setMessage(R.string.logout_message)
                .setPositiveButton(R.string.logout_button, (dialog, id) -> {
                    Intent intent = new Intent(this, LoginActivity.class);
                    startActivity(intent);
                    overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
                    finish();
                })
                .setNegativeButton(R.string.cancel, null)
                .create()
                .show();
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
            return;
        }

        if (mFragmentManager.getBackStackEntryCount() == 0) {
            if (mCurrentMenuID == R.id.menu_record || mCurrentMenuID == R.id.menu_job_profile || mCurrentMenuID == R.id.menu_change_pass) {
                setRootFragement(R.id.menu_find_job);
            } else {
                logout();
            }
        } else {
            popFragment();
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {

        getCurrentFragment().onMenuSelected(item.getItemId());

        return super.onOptionsItemSelected(item);
    }

    @Override
    public boolean onNavigationItemSelected(MenuItem item) {

        int id = item.getItemId();

        switch (id) {
            case R.id.menu_share:
                Intent sharingIntent = new Intent(Intent.ACTION_SEND);
                sharingIntent.setType("text/html");
                String link = AppData.userRole == Role.RECRUITER_ID ? "https://www.myjobpitch.com/recruiters/" : "https://www.myjobpitch.com/candidates/";
                sharingIntent.putExtra(android.content.Intent.EXTRA_TEXT, link);
                startActivity(Intent.createChooser(sharingIntent,getResources().getString(R.string.share_title)));
                return true;

            case R.id.menu_contact_us:
                Intent emailIntent = new Intent(Intent.ACTION_SENDTO);
                emailIntent.setData(Uri.parse("mailto:support@myjobpitch.com"));
                startActivity(emailIntent);
                return true;

            case R.id.menu_logout:
                logout();
                return true;

            default:
                setRootFragement(id);
        }

        mDrawer.closeDrawer(GravityCompat.START);
        return true;
    }

    /************ sidebar menu item data ***********/

    private static final Map<Integer, Class> menuItemData = new HashMap<Integer, Class>() {{
        put(R.id.menu_js_find, FindJobFragment.class);
        put(R.id.menu_js_applications, TalentApplicationsFragment.class);
        put(R.id.menu_js_messages, MessageListFragment.class);
        put(R.id.menu_js_interview, InterviewsFragment.class);
        put(R.id.menu_job_profile, JobProfileFragment.class);
        put(R.id.menu_record, PitchFragment.class);
        put(R.id.menu_user_profile, TalentDetailsFragment.class);

        put(R.id.menu_rc_find, SelectJobFragment.class);
        put(R.id.menu_rc_applications, SelectJobFragment.class);
        put(R.id.menu_applications, SelectJobFragment.class);
        put(R.id.menu_connections, SelectJobFragment.class);
        put(R.id.menu_rc_messages, MessageListFragment.class);
        put(R.id.menu_rc_interview, SelectJobFragment.class);
        put(R.id.menu_business, BusinessListFragment.class);
        put(R.id.menu_users, BusinessListFragment.class);
        put(R.id.menu_payment, PaymentFragment.class);

        put(R.id.menu_hr, HRFragment.class);
        put(R.id.menu_employees, EmployeeListFragment.class);

        put(R.id.menu_change_pass, ChangePasswordFragment.class);
        put(R.id.menu_help, HelpFragment.class);
    }};
}
