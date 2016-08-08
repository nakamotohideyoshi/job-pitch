//
//  CreateProfile.m
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "CreateProfile.h"
#import "CreateRecruiterProfile.h"

@implementation CreateProfile

- (IBAction)logout:(id)sender {
    [AppHelper logout];
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
