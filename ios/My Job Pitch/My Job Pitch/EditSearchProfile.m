//
//  EditSearchProfile.m
//  My Job Pitch
//
//  Created by user on 27/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "EditSearchProfile.h"

@interface EditSearchProfile ()

@end

@implementation EditSearchProfile {
    Profile *myProfile;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    jobSeekerSearchProfile.delegate = self;
    jobSeekerSearchProfile.continueButton.titleLabel.text = @"Save";
    [jobSeekerSearchProfile setContracts:self.appDelegate.contracts];
    [jobSeekerSearchProfile setHoursOptions:self.appDelegate.hours];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewWillAppear:(BOOL)animated
{
    [self showProgress:true];
    [[self appDelegate].api loadJobProfileWithId:self.profileId
                                         success:^(Profile *profile) {
                                             myProfile = profile;
                                             [jobSeekerSearchProfile load:profile];
                                             [self showProgress:false];
                                         }
                                         failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                             [self handleErrors:errors message:message];
                                         }];
}

- (NSArray *)getRequiredFields {
    if (!jobSeekerSearchProfile.hidden) {
        return @[];
    } else {
        return @[];
    }
}

- (NSDictionary*)getFieldMap {
    return @{@"contract": jobSeekerSearchProfile.contract.textField,
             @"hours": jobSeekerSearchProfile.hours.textField,
             };
}

- (NSDictionary *)getErrorViewMap {
    return @{@"contract": jobSeekerSearchProfile.contract.errorLabel,
             @"hours": jobSeekerSearchProfile.hours.errorLabel,
             };
}

- (void)continue
{
    NSLog(@"continue");
    if ([self validate]) {
        [jobSeekerSearchProfile save:myProfile];
        [self showProgress:true];
        [[self appDelegate].api saveJobProfile:myProfile
                                       success:^(Profile *profile) {
                                           [self clearErrors];
                                           [self.navigationController popViewControllerAnimated:true];
                                       }
                                       failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                           [self handleErrors:errors message:message];
                                           [self showProgress:false];
                                       }
         ];
    }
}

@end
