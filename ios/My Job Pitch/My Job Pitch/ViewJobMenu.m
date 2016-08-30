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

@property (weak, nonatomic) IBOutlet UILabel *tokensLabel;
@end

@implementation ViewJobMenu

-(void)viewWillAppear:(BOOL)animated {
    self.tokensLabel.text = [NSString stringWithFormat:@"%d tokens", self.job.locationData.businessData.tokens.intValue];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    ViewJob *jobView = [segue destinationViewController];
    [jobView setJob:self.job];
    if ([[segue identifier] isEqualToString:@"goto_job_search"]) {
        [jobView setMode:JobViewModeSearch];
        jobView.strTitle = @"Job seekers";
    } else if ([[segue identifier] isEqualToString:@"goto_job_applications"]) {
        [jobView setMode:JobViewModeApplications];
        jobView.strTitle = @"Applications";
    } else if ([[segue identifier] isEqualToString:@"goto_shortlist"]) {
        [jobView setMode:JobViewModeApplications];
        jobView.strTitle = @"Shortlist";
    } else if ([[segue identifier] isEqualToString:@"goto_job_connections"]) {
        [jobView setMode:JobViewModeConnections];
        jobView.strTitle = @"Connections";
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
        [SVProgressHUD show];
        [self.appDelegate.api deleteJob:_job
                                success:^(void) {
                                    [SVProgressHUD dismiss];
                                    [self.navigationController popViewControllerAnimated:YES];
                                } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                    [MyAlertController showError:@"Error deleting data" callback:nil];
                                }];
        
    } cancel:@"Cancel" cancelCallback:nil];
}

@end