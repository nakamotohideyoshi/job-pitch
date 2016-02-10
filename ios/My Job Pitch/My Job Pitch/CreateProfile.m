//
//  CreateProfile.m
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "CreateProfile.h"

@implementation CreateProfile

- (void)viewDidLoad {
    [super viewDidLoad];
    jobSeekerProfile.delegate = self;
    [jobSeekerProfile setSexes:self.appDelegate.sexes];
    [jobSeekerProfile setNationalities:self.appDelegate.nationalities];
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
        [self.navigationController popViewControllerAnimated:true];
    }
}

- (void)showJobSeeker {
    NSLog(@"showJobSeeker");
    [self->jobSeekerProfile setHidden:false];
    [self->recruiterProfile setHidden:true];
    [self->recruiterBottomContraint setPriority:UILayoutPriorityDefaultLow+1];
}

- (void)showRecruiter {
    NSLog(@"showRecruiter");
    [self->jobSeekerProfile setHidden:true];
    [self->recruiterProfile setHidden:false];
    [self->recruiterBottomContraint setPriority:UILayoutPriorityRequired-1];
}

- (NSArray *)getRequiredFields {
    if (!jobSeekerProfile.hidden) {
        return @[@"firstName", @"lastName", @"description"];
    } else {
        return @[@"name", @"description"];
    }
}

- (NSDictionary*)getFieldMap {
    if (!jobSeekerProfile.hidden) {
        return @{@"firstName": jobSeekerProfile.firstName.textField,
                 @"lastName": jobSeekerProfile.lastName.textField,
                 @"email": jobSeekerProfile.email.textField,
                 @"telephone": jobSeekerProfile.telephone.textField,
                 @"mobile": jobSeekerProfile.mobile.textField,
                 @"age": jobSeekerProfile.age.textField,
                 @"description": jobSeekerProfile.descriptionView,
                 };
    } else {
        return @{};
    }
}

- (NSDictionary *)getErrorViewMap {
    if (!jobSeekerProfile.hidden) {
        return @{@"firstName": jobSeekerProfile.firstName.errorLabel,
                 @"lastName": jobSeekerProfile.lastName.errorLabel,
                 @"email": jobSeekerProfile.email.errorLabel,
                 @"telephone": jobSeekerProfile.telephone.errorLabel,
                 @"mobile": jobSeekerProfile.mobile.errorLabel,
                 @"age": jobSeekerProfile.age.errorLabel,
                 @"description": jobSeekerProfile.descriptionError,
                 };
    } else {
        return @{};
    }
}

- (void)continue
{
    NSLog(@"continue");
    if ([self validate]) {
        JobSeeker *jobSeeker = [JobSeeker alloc];
        [jobSeekerProfile save:jobSeeker];
        [self showProgress:true];
        [[self appDelegate].api saveJobSeeker:jobSeeker
                                      success:^(JobSeeker *jobSeeker) {
                                          [self clearErrors];
                                          [self replaceWithViewControllerNamed:@"job_seeker_home"];
                                      }
                                      failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                          [self handleErrors:errors message:message];
                                          [self showProgress:false];
                                      }
         ];
    }
}

- (void)replaceWithViewControllerNamed:(NSString*)name
{
    UIViewController *destinationController = [self.storyboard instantiateViewControllerWithIdentifier:name];
    [self.navigationController pushViewController:destinationController animated:YES];
    NSMutableArray *navigationArray = [[NSMutableArray alloc] initWithArray: self.navigationController.viewControllers];
    [navigationArray removeObject:self];
    self.navigationController.viewControllers = navigationArray;
}

@end
