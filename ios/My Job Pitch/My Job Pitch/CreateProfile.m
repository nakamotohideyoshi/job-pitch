//
//  CreateProfile.m
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "CreateProfile.h"
#import "CreateRecruiterProfile.h"
#import "MyAlertController.h"

@implementation CreateProfile

- (void)viewWillAppear:(BOOL)animated
{
    activityIndicator.hidden = YES;
}

- (IBAction)logout {
    [MyAlertController title:@"Logout" message:@"Are you sure you want to logout?" ok:@"Yes" okCallback:^{
        [self.navigationController popViewControllerAnimated:true];
    } cancel:@"No" cancelCallback:nil];
}

- (void)showJobSeeker {
    NSLog(@"showJobSeeker");
    [self performSegueWithIdentifier:@"goto_create_job_seeker_profile" sender:self];
    
}

- (void)showRecruiter {
    NSLog(@"showRecruiter");
    
    CreateRecruiterProfile *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"CreateRecruiterProfile"];
    controller.isFirst = YES;
    [self.navigationController pushViewController:controller animated:YES];
}

@end
