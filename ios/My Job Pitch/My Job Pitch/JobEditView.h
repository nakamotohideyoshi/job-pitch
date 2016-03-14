//
//  JobEditView.h
//  My Job Pitch
//
//  Created by user on 13/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "Job.h"
#import "ErrorTextField.h"
#import <DownPicker.h>

@interface JobEditView : UIView<UIImagePickerControllerDelegate, UINavigationControllerDelegate>

@property (nullable) UIImage *imageForUpload;
@property (weak, nonatomic) IBOutlet UISwitch *active;
@property (weak, nonatomic) IBOutlet ErrorTextField *title;

@property (weak, nonatomic) IBOutlet UITextView *descriptionView;
@property (weak, nonatomic) IBOutlet UILabel *descriptionError;
@property (weak, nonatomic) IBOutlet UILabel *descriptionCharactersRemaining;

@property (weak, nonatomic) IBOutlet ErrorTextField *sector;
@property (nonnull) DownPicker *sectorsPicker;
@property (weak, nonatomic) IBOutlet ErrorTextField *contract;
@property (nonnull) DownPicker *contractPicker;
@property (weak, nonatomic) IBOutlet ErrorTextField *hours;
@property (nonnull) DownPicker *hoursPicker;

@property (weak, nonatomic) IBOutlet UIImageView *imageView;
@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *imageActivity;
@property (weak, nonatomic) IBOutlet UILabel *noImage;
@property (weak, nonatomic) IBOutlet UIButton *changeButton;
@property (weak, nonatomic) IBOutlet UIButton *deleteButton;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *changeCenterContraint;

- (void)load:(nonnull Job*)job;
- (void)save:(nonnull Job*)job;
- (IBAction)changeImage:(nullable id)sender;
- (IBAction)deleteImage:(nullable id)sender;

- (void)setContractOptions:(nonnull NSArray*)contractObjects;
- (void)setHoursOptions:(nonnull NSArray*)hoursObjects;
- (void)setSectorOptions:(nonnull NSArray*)sectorObjects;
- (void)setStatusOptions:(nonnull NSArray*)statusOptionsx;

@end
