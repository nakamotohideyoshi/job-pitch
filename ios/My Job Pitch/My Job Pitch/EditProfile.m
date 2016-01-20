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
}

- (void)viewDidLoad {
    [super viewDidLoad];
    jobSeekerProfile.delegate = self;
    jobSeekerProfile.continueButton.titleLabel.text = @"Save";
    // Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewWillAppear:(BOOL)animated
{
    [self showProgress:true];
    [[self appDelegate].api loadJobSeekerWithId:[self appDelegate].user.jobSeeker
                                        success:^(JobSeeker *jobSeeker) {
                                            myJobSeeker = jobSeeker;
                                            [jobSeekerProfile load:jobSeeker];
                                            [self showProgress:false];
                                        }
                                        failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                            [self handleErrors:errors message:message];
                                        }];
}

- (NSArray *)getRequiredFields {
    if (!jobSeekerProfile.hidden) {
        return @[@"firstName", @"lastName", @"description"];
    } else {
        return @[];
    }
}

- (NSDictionary*)getFieldMap {
    return @{@"firstName": jobSeekerProfile.firstName.textField,
             @"lastName": jobSeekerProfile.lastName.textField,
             @"email": jobSeekerProfile.email.textField,
             @"telephone": jobSeekerProfile.telephone.textField,
             @"mobile": jobSeekerProfile.mobile.textField,
             @"age": jobSeekerProfile.age.textField,
             @"description": jobSeekerProfile.descriptionView,
             };
}

- (NSDictionary *)getErrorViewMap {
    return @{@"firstName": jobSeekerProfile.firstName.errorLabel,
             @"lastName": jobSeekerProfile.lastName.errorLabel,
             @"email": jobSeekerProfile.email.errorLabel,
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
        [self showProgress:true];
        [[self appDelegate].api saveJobSeeker:myJobSeeker
                                      success:^(JobSeeker *jobSeeker) {
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
