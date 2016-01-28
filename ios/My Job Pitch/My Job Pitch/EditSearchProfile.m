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
    [jobSeekerSearchProfile.continueButton setTitle:@"Save" forState:UIControlStateNormal];
    [jobSeekerSearchProfile setContracts:self.appDelegate.contracts];
    [jobSeekerSearchProfile setHoursOptions:self.appDelegate.hours];
    [jobSeekerSearchProfile setSectorOptions:self.appDelegate.sectors];
    [jobSeekerSearchProfile setNavigationController:self.navigationController];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewWillAppear:(BOOL)animated
{
    if (self.profileId) {
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
    } else {
        [self showProgress:false];
        myProfile = [[Profile alloc] init];
        [jobSeekerSearchProfile load:myProfile];
    }
}

- (NSArray *)getRequiredFields {
    if (!jobSeekerSearchProfile.hidden) {
        return @[@"sectors", @"searchRadius", @"location"];
    } else {
        return @[];
    }
}

- (NSDictionary*)getFieldMap {
    return @{@"sectors": jobSeekerSearchProfile.sectors.textField,
             @"contract": jobSeekerSearchProfile.contract.textField,
             @"hours": jobSeekerSearchProfile.hours.textField,
             @"location": jobSeekerSearchProfile.location.textField,
             @"searchRadius": jobSeekerSearchProfile.radius.textField,
             };
}

- (NSDictionary *)getErrorViewMap {
    return @{@"sectors": jobSeekerSearchProfile.sectors.errorLabel,
             @"contract": jobSeekerSearchProfile.contract.errorLabel,
             @"hours": jobSeekerSearchProfile.hours.errorLabel,
             @"location": jobSeekerSearchProfile.location.errorLabel,
             @"searchRadius": jobSeekerSearchProfile.radius.errorLabel,
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
