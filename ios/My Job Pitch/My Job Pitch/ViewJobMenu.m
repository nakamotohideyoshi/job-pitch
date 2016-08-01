//
//  ViewJobMenu.m
//  My Job Pitch
//
//  Created by user on 13/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ViewJobMenu.h"
#import "ViewJob.h"
#import "EditJob.h"

@interface ViewJobMenu ()

@end

@implementation ViewJobMenu

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    ViewJob *jobView = [segue destinationViewController];
    [jobView setJob:self.job];
    if ([[segue identifier] isEqualToString:@"goto_job_search"]) {
        [jobView setMode:JobViewModeSearch];
    } else if ([[segue identifier] isEqualToString:@"goto_job_applications"]) {
        [jobView setMode:JobViewModeApplications];
    } else if ([[segue identifier] isEqualToString:@"goto_job_connections"]) {
        [jobView setMode:JobViewModeConnections];
    }
}

- (IBAction)editJob:(id)sender {
    EditJob *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"EditJob"];
    controller.job = _job;
    [self.navigationController pushViewController:controller animated:YES];
}

- (IBAction)removeJob:(id)sender {
    NSString *msg = [NSString stringWithFormat:@"Are you sure you want to delete %@", _job.title];
    [MyAlertController title:@"Confirm" message:msg ok:@"Delete" okCallback:^{
        [self showProgress:true];
        [self.appDelegate.api deleteJob:_job
                                success:^(void) {
                                    [self showProgress:false];
                                    [self.navigationController popViewControllerAnimated:YES];
                                } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                    [MyAlertController title:@"Error" message:@"Error deleting data"
                                                          ok:@"Okay" okCallback:nil cancel:nil cancelCallback:nil];
                                }];
        
    } cancel:@"Cancel" cancelCallback:nil];
}

@end