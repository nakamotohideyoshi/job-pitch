//
//  LocationEditView.h
//  My Job Pitch
//
//  Created by user on 09/02/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "Location.h"
#import "ErrorTextField.h"
#import "LocationMapView.h"

@interface LocationEditView : UIView<LocationMapViewDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate>

@property (weak, nonatomic) IBOutlet ErrorTextField *name;
@property (weak, nonatomic) IBOutlet ErrorTextField *desc;
@property (weak, nonatomic) IBOutlet ErrorTextField *email;
@property (weak, nonatomic) IBOutlet UISwitch *emailPublic;
@property (weak, nonatomic) IBOutlet ErrorTextField *telephone;
@property (weak, nonatomic) IBOutlet UISwitch *telephonePublic;
@property (weak, nonatomic) IBOutlet ErrorTextField *mobile;
@property (weak, nonatomic) IBOutlet UISwitch *mobilePublic;
@property (weak, nonatomic) IBOutlet ErrorTextField *location;
@property (nullable) UIImage *imageForUpload;

@property (weak, nonatomic) IBOutlet UIImageView *imageView;
@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *imageActivity;
@property (weak, nonatomic) IBOutlet UILabel *noImage;
@property (weak, nonatomic) IBOutlet UIButton *changeButton;
@property (weak, nonatomic) IBOutlet UIButton *deleteButton;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *changeCenterContraint;


- (IBAction)changeLocation:(nullable id)sender;

- (void)load:(nonnull Location*)location;
- (void)save:(nonnull Location*)location;
- (IBAction)changeImage:(nullable id)sender;
- (IBAction)deleteImage:(nullable id)sender;

@end
