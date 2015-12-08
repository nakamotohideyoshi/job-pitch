//
//  CreateProfile.m
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "CreateProfile.h"

@interface CreateProfile<JobSeekerProfileViewDelegate> ()

@end

@implementation CreateProfile

- (void)viewDidLoad {
    [super viewDidLoad];
    jobSeekerProfile.delegate = self;
    // Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewWillAppear:(BOOL)animated
{
    activityIndicator.hidden = YES;
}

- (IBAction)logout {
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Logout"
                                                    message:@"Are you sure you want to logout?"
                                                   delegate:self
                                          cancelButtonTitle:@"No"
                                          otherButtonTitles:@"Yes", nil];
    [alert show];
}

- (void)alertView:(UIAlertView *)alertView didDismissWithButtonIndex:(NSInteger)buttonIndex {
    if (buttonIndex == 1) {
        [self dismissViewControllerAnimated:true completion:^{}];
    }
}

- (void)showJobSeeker {
    NSLog(@"showJobSeeker");
    [self->jobSeekerProfile setHidden:false];
}

- (void)showRecruiter {
    NSLog(@"showRecruiter");
    [self->jobSeekerProfile setHidden:true];
}

- (NSArray *)getRequiredFields {
    if (jobSeekerProfile.hidden) {
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
             @"description": jobSeekerProfile.description,
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

@end
