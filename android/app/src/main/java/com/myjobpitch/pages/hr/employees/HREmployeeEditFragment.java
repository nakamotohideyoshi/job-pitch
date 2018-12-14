package com.myjobpitch.pages.hr.employees;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.ProgressBar;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.MainActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.HREmployee;
import com.myjobpitch.api.data.HRJob;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.fragments.FormFragment;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;
import com.myjobpitch.views.SelectDialog;
import com.rengwuxian.materialedittext.MaterialEditText;
import com.weiwangcn.betterspinner.library.material.MaterialBetterSpinner;

import org.springframework.core.io.FileSystemResource;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class HREmployeeEditFragment extends FormFragment {

    @BindView(R.id.image_view)
    ImageView mAvatarView;
    @BindView(R.id.progress_bar)
    ProgressBar progressBar;

    @BindView(R.id.first_name)
    MaterialEditText mFirstNameView;
    @BindView(R.id.last_name)
    MaterialEditText mLastNameView;

    @BindView(R.id.email)
    MaterialEditText mEmailView;

    @BindView(R.id.telephone)
    MaterialEditText mTelephoneView;

    @BindView(R.id.gender)
    MaterialBetterSpinner mSexView;

    @BindView(R.id.birthday)
    MaterialEditText mBirthdayView;

    @BindView(R.id.nationality)
    MaterialEditText mNationalityView;

    @BindView(R.id.national_number)
    MaterialEditText mNationalNumberView;

    @BindView(R.id.business)
    MaterialEditText businessView;

    @BindView(R.id.job)
    MaterialEditText jobView;

    public HREmployee hrEmployee;

    Uri avatarUri;

    Integer nationality;
    Integer business;
    Integer job;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_hremployee_edit, container, false);
        ButterKnife.bind(this, view);

        if (hrEmployee == null) {
            title = "Add Employee";
        } else {
            title = "Edit Employee";

            final String imagePath = hrEmployee.getProfile_thumb();
            if (imagePath != null) {
                AppHelper.loadImage(imagePath, mAvatarView);
            } else {
                mAvatarView.setImageResource(R.drawable.avatar);
            }

            mFirstNameView.setText(hrEmployee.getFirst_name());
            mLastNameView.setText(hrEmployee.getLast_name());

            mEmailView.setText(hrEmployee.getEmail());

            mTelephoneView.setText(hrEmployee.getTelephone());

            if (hrEmployee.getSex() != null) {
                mSexView.setText(AppData.getNameById(AppData.sexes, hrEmployee.getSex()));
            }

            mBirthdayView.setText(hrEmployee.getBirthday());

            mNationalNumberView.setText(hrEmployee.getNational_insurance_number());

            nationality = hrEmployee.getNationality();
            if (nationality != null) {
                mNationalityView.setText(AppData.getObjById(AppData.nationalities, nationality).getName());
            }

            business = hrEmployee.getBusiness();
            Business businessData = AppData.getObjById(AppData.businesses, business);
            if (businessData != null) {
                businessView.setText(businessData.getName());
            }

            job = hrEmployee.getJob();
            HRJob jobData = AppData.getObjById(AppData.hrJobs, job);
            if (jobData != null) {
                jobView.setText(jobData.getTitle());
            }
        }

        return  view;
    }

    @OnClick({R.id.image_view, R.id.avata_add_button})
    void onPhotoAction() {
        getApp().showFilePicker(true);
    }

    @OnClick(R.id.nationality)
    void onNationality() {
        ArrayList<SelectDialog.SelectItem> items = new ArrayList<>();
        for (int i = 0; i < AppData.nationalities.size(); i++) {
            Nationality obj = AppData.nationalities.get(i);
            items.add(new SelectDialog.SelectItem(obj.getName(), false));
        }

        new SelectDialog(getContext(), "Select Nationality", items, false, selectedIndex -> {
            Nationality obj = AppData.nationalities.get(selectedIndex);
            nationality = obj.getId();
            mNationalityView.setText(obj.getName());
        });
    }

    @OnClick(R.id.national_number_help)
    void onNationalNumberHelp() {
        Popup popup = new Popup(getContext(), "Supplying your national insurance number makes it easier for employers to recruit you. Your National Insurance number will not be shared with employers.", true);
        popup.addGreyButton(R.string.close, null);
        popup.show();
    }

    @OnClick(R.id.business)
    void onBusiness() {
        ArrayList<SelectDialog.SelectItem> items = new ArrayList<>();
        for (int i = 0; i < AppData.businesses.size(); i++) {
            Business obj = AppData.businesses.get(i);
            items.add(new SelectDialog.SelectItem(obj.getName(), false));
        }

        new SelectDialog(getContext(), "Select Business", items, false, selectedIndex -> {
            Business obj = AppData.businesses.get(selectedIndex);
            business = obj.getId();
            businessView.setText(obj.getName());
        });
    }

    @OnClick(R.id.job)
    void onJob() {
        ArrayList<SelectDialog.SelectItem> items = new ArrayList<>();
        for (int i = 0; i < AppData.hrJobs.size(); i++) {
            HRJob obj = AppData.hrJobs.get(i);
            items.add(new SelectDialog.SelectItem(obj.getTitle(), false));
        }

        new SelectDialog(getContext(), "Select Job", items, false, selectedIndex -> {
            HRJob obj = AppData.hrJobs.get(selectedIndex);
            job = obj.getId();
            jobView.setText(obj.getTitle());
        });
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("first_name", mFirstNameView);
                put("last_name", mLastNameView);
                put("business", businessView);
                put("job", jobView);
            }
        };
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
            if (requestCode == AppData.REQUEST_IMAGE_CAPTURE) {
                Bitmap photo = (Bitmap) data.getExtras().get("data");
                File file = AppHelper.saveBitmap(photo);
                setAvatarUri(Uri.fromFile(file));
            } else if (requestCode == AppData.REQUEST_IMAGE_PICK) {
                setAvatarUri(data.getData());
            } else if (requestCode == AppData.REQUEST_GOOGLE_DRIVE || requestCode == AppData.REQUEST_DROPBOX) {
                String path = (String) data.getExtras().get("path");
                setAvatarUri(Uri.fromFile(new File(path)));
            }
        }
    }

    @OnClick(R.id.save_button)
    void onSave() {
        if (!valid()) return;

        HREmployee newHREmployee = new HREmployee();
        newHREmployee.setFirst_name(mFirstNameView.getText().toString().trim());
        newHREmployee.setLast_name(mLastNameView.getText().toString().trim());
        newHREmployee.setEmail(mEmailView.getText().toString().trim());
        newHREmployee.setTelephone(mTelephoneView.getText().toString().trim());
        Integer sex = AppData.getIdByName(AppData.sexes, mSexView.getText().toString());
        if (sex != -1) {
            newHREmployee.setSex(sex);
        }
        newHREmployee.setBirthday(mBirthdayView.getText().toString());
        newHREmployee.setNationality(nationality);
        newHREmployee.setNational_insurance_number(mNationalNumberView.getText().toString().trim());
        newHREmployee.setBusiness(business);
        newHREmployee.setJob(job);

        showLoading();

        new APITask(() -> {
            File avatarFile = null;
            FileSystemResource avatarFileResource = null;

            if ( avatarUri != null) {
                try {
                    File dir = new File(Environment.getExternalStorageDirectory(), "MyJobPitch");
                    if (!dir.exists()) {
                        dir.mkdirs();
                    }
                    String filename = "profile_" + avatarUri.getLastPathSegment();
                    avatarFile = new File(dir, filename);

                    // Copy imageUri content to temp file
                    InputStream in = getApp().getContentResolver().openInputStream(avatarUri);
                    FileOutputStream out = new FileOutputStream(avatarFile);
                    byte[] buf = new byte[1024];
                    int len;
                    while ((len = in.read(buf)) > 0)
                        out.write(buf, 0, len);
                    out.close();
                    in.close();

                    avatarFileResource = new FileSystemResource(avatarFile);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            hrEmployee = MJPApi.shared().updateHREmployee(hrEmployee == null ? null : hrEmployee.getId(), newHREmployee, avatarFileResource);

            if (avatarFile != null) {
                avatarFile.delete();
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                AppData.updateObj(AppData.hrEmployees, hrEmployee);
                getApp().popFragment();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    void setAvatarUri(Uri uri) {
        String path;
        String[] projection = { MediaStore.Images.Media.DATA };
        Cursor cursor = MainActivity.shared().getContentResolver().query(uri, projection, null, null, null);
        if(cursor != null) {
            int column_index = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATA);
            cursor.moveToFirst();
            path = cursor.getString(column_index);
        } else {
            path = uri.getPath();
        }

        try {
            ExifInterface exif = new ExifInterface(path);
            int orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, 1);
            Matrix matrix = new Matrix();
            switch (orientation) {
                case ExifInterface.ORIENTATION_ROTATE_90:
                    matrix.postRotate(90);
                    break;
                case ExifInterface.ORIENTATION_ROTATE_180:
                    matrix.postRotate(180);
                    break;
                case ExifInterface.ORIENTATION_ROTATE_270:
                    matrix.postRotate(270);
                    break;
            }
            Bitmap bitmap = BitmapFactory.decodeFile(path);
            bitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
            mAvatarView.setImageBitmap(bitmap);
            avatarUri = uri;
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
