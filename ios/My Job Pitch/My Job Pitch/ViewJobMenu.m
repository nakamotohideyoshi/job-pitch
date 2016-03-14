//
//  ViewJobMenu.m
//  My Job Pitch
//
//  Created by user on 13/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ViewJobMenu.h"
#import "ViewJob.h"

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

@end
