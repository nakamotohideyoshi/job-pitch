//
//  CreateProfile.m
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "CreateProfile.h"
#import "CreateRecruiterProfile.h"
#import "HowViewController.h"

@implementation CreateProfile

- (void)viewDidLoad {
    [super viewDidLoad];
    
}

- (IBAction)logout:(id)sender {
    [AppHelper logout];
}

- (IBAction)clickJobSeeker:(id)sender {
    [self performSegueWithIdentifier:@"HowItWorks" sender:@"jobSeeker"];
}

- (IBAction)clickRecruiter:(id)sender {
    [self performSegueWithIdentifier:@"HowItWorks" sender:@"recruiter"];
}

- (void)showJobSeeker {
    NSLog(@"showJobSeeker");
    [self performSegueWithIdentifier:@"goto_create_job_seeker_profile" sender:self];
}

- (void)showRecruiter {
    NSLog(@"showRecruiter");
    CreateRecruiterProfile *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"CreateRecruiterProfile"];
    controller.isFirst = YES;
    [self.navigationController pushViewController:controller animated:NO];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if (![sender isEqual:self]) {
        HowViewController *controller = [segue destinationViewController];
        controller.createProfile = self;
        controller.isJobSeeker = [sender isEqual: @"jobSeeker"];
    }
}

@end
