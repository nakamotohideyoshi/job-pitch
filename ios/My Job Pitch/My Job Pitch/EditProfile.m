//
//  EditProfile.m
//  My Job Pitch
//
//  Created by user on 07/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "EditProfile.h"

@interface EditProfile ()

@end

@implementation EditProfile {
    JobSeeker* myJobSeeker;
    NSString *backTitle;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    jobSeekerProfile.delegate = self;
    [jobSeekerProfile.continueButton setTitle:@"Save" forState:UIControlStateNormal];
    [jobSeekerProfile setSexes:self.appDelegate.sexes];
    [jobSeekerProfile setNationalities:self.appDelegate.nationalities];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewWillAppear:(BOOL)animated
{
    [SVProgressHUD show];
    [[self appDelegate].api loadJobSeekerWithId:[self appDelegate].user.jobSeeker
                                        success:^(JobSeeker *jobSeeker) {
                                            myJobSeeker = jobSeeker;
                                            [jobSeekerProfile load:jobSeeker];
                                            [SVProgressHUD dismiss];
                                        }
                                        failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                            [self handleErrors:errors message:message];
                                        }];
    backTitle = self.navigationController.navigationBar.topItem.title;
    self.navigationController.navigationBar.topItem.title = @"Cancel";
}

- (void)viewWillDisappear:(BOOL)animated
{
    self.navigationController.navigationBar.topItem.title = backTitle;
}

- (NSArray *)getRequiredFields {
    if (!jobSeekerProfile.hidden) {
        return @[@"firstName", @"lastName", @"email", @"description"];
    } else {
        return @[];
    }
}

- (NSDictionary*)getFieldMap {
    return @{@"firstName": jobSeekerProfile.firstName.textField,
             @"lastName": jobSeekerProfile.lastName.textField,
             @"telephone": jobSeekerProfile.telephone.textField,
             @"mobile": jobSeekerProfile.mobile.textField,
             @"age": jobSeekerProfile.age.textField,
             @"description": jobSeekerProfile.descriptionView,
             };
}

- (NSDictionary *)getErrorViewMap {
    return @{@"firstName": jobSeekerProfile.firstName.errorLabel,
             @"lastName": jobSeekerProfile.lastName.errorLabel,
             @"telephone": jobSeekerProfile.telephone.errorLabel,
             @"mobile": jobSeekerProfile.mobile.errorLabel,
             @"age": jobSeekerProfile.age.errorLabel,
             @"description": jobSeekerProfile.descriptionError,
             };
}

- (void)continue
{
    NSLog(@"continue");
    if ([self validate]) {
        [jobSeekerProfile save:myJobSeeker];
        [SVProgressHUD show];
        [[self appDelegate].api saveJobSeeker:myJobSeeker
                                      success:^(JobSeeker *jobSeeker) {
                                          [SVProgressHUD dismiss];
                                          [self clearErrors];
                                          [self.navigationController popViewControllerAnimated:true];
                                      }
                                      failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                          [self handleErrors:errors message:message];
                                      }
         ];
    }
}

@end
