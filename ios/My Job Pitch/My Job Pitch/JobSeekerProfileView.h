//
//  JobSeekerProfileView.h
//  My Job Pitch
//
//  Created by user on 07/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "ErrorTextField.h"
#import "JobSeeker.h"
#import <DownPicker.h>

@protocol JobSeekerProfileViewDelegate
- (void)continue;
@end

@interface JobSeekerProfileView : UIView

@property (weak, nonatomic) IBOutlet UISwitch *active;
@property (weak, nonatomic) IBOutlet ErrorTextField *firstName;
@property (weak, nonatomic) IBOutlet UISwitch *firstNamePublic;
@property (weak, nonatomic) IBOutlet ErrorTextField *lastName;
@property (weak, nonatomic) IBOutlet UISwitch *lastNamePublic;
@property (weak, nonatomic) IBOutlet ErrorTextField *email;
@property (weak, nonatomic) IBOutlet UISwitch *emailPublic;
@property (weak, nonatomic) IBOutlet ErrorTextField *telephone;
@property (weak, nonatomic) IBOutlet UISwitch *telephonePublic;
@property (weak, nonatomic) IBOutlet ErrorTextField *mobile;
@property (weak, nonatomic) IBOutlet UISwitch *mobilePublic;
@property (weak, nonatomic) IBOutlet ErrorTextField *age;
@property (weak, nonatomic) IBOutlet UISwitch *agePublic;
@property (weak, nonatomic) IBOutlet ErrorTextField *sex;
@property (nonnull) DownPicker *sexPicker;
@property (weak, nonatomic) IBOutlet UISwitch *sexPublic;
@property (weak, nonatomic) IBOutlet ErrorTextField *nationality;
@property (nonnull) DownPicker *nationalityPicker;
@property (weak, nonatomic) IBOutlet UISwitch *nationalityPublic;
@property (weak, nonatomic) IBOutlet UITextView *descriptionView;
@property (weak, nonatomic) IBOutlet UILabel *descriptionError;
@property (weak, nonatomic) IBOutlet UILabel *descriptionCharactersRemaining;
@property (weak, nonatomic) IBOutlet UISwitch *hasReferences;
@property (weak, nonatomic) IBOutlet UIButton *continueButton;

@property (weak, nonatomic) IBOutlet UISwitch *tickBox;

@property (weak, nonatomic) IBOutlet UILabel *cvFileName;
@property (weak, nonatomic) IBOutlet UIButton *selectButton;

@property (weak, nonatomic, nullable) id<JobSeekerProfileViewDelegate> delegate;

- (IBAction)continue:(nullable id)sender;
- (void)load:(nonnull JobSeeker*)jobSeeker;
- (void)save:(nonnull JobSeeker*)jobSeeker;
- (void)setSexes:(nonnull NSArray*)sexObjects;
- (void)setNationalities:(nonnull NSArray*)nationalityObjects;

@end
