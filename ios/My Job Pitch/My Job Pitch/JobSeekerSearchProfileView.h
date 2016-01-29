//
//  JobSeekerSearchProfileView.h
//  My Job Pitch
//
//  Created by user on 27/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "ErrorTextField.h"
#import "Profile.h"
#import <DownPicker.h>
#import "DownPickerMultiple.h"
#import "LocationMapView.h"

@protocol JobSeekerSearchProfileViewDelegate
- (void)continue;
@end

@interface JobSeekerSearchProfileView : UIView<LocationMapViewDelegate>

@property (weak, nonatomic) IBOutlet ErrorTextField *sectors;
@property (nonnull) DownPickerMultiple *sectorsPicker;
@property (weak, nonatomic) IBOutlet ErrorTextField *contract;
@property (nonnull) DownPicker *contractPicker;
@property (weak, nonatomic) IBOutlet ErrorTextField *hours;
@property (nonnull) DownPicker *hoursPicker;
@property (weak, nonatomic) IBOutlet ErrorTextField *location;
@property (weak, nonatomic) IBOutlet ErrorTextField *radius;
@property (nonnull) DownPicker *radiusPicker;

@property (weak, nonatomic) IBOutlet UIButton *continueButton;

@property (weak, nonatomic, nullable) id<JobSeekerSearchProfileViewDelegate> delegate;

@property (weak, nonatomic) UINavigationController *navigationController;

- (IBAction)changeLocation:(nullable id)sender;
- (IBAction)continue:(nullable id)sender;
- (void)load:(nonnull Profile*)profile;
- (void)save:(nonnull Profile*)profile;
- (void)setContracts:(nonnull NSArray*)contractObjects;
- (void)setHoursOptions:(nonnull NSArray*)hoursObjects;
- (void)setSectorOptions:(nonnull NSArray*)sectorObjects;

@end
