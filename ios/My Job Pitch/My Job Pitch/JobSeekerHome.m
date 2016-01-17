//
//  JobSeekerHome.m
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "JobSeekerHome.h"

@interface JobSeekerHome ()
@property (nonnull) NSMutableArray* jobs;
@property (nonnull) NSMutableArray* seen;
@property (nullable) Job* job;
@property NSUInteger lastLoad;
@property Boolean loading;
@end

@implementation JobSeekerHome

- (void)viewDidLoad {
    [super viewDidLoad];
    self.swipeView.delegate = self;
    self.jobs = [[NSMutableArray alloc] init];
    self.seen = [[NSMutableArray alloc] init];
    self.job = nil;
    self.lastLoad = 999;
    [self nextCard];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)connect {
    [self.swipeView swipeLeft:^{
        [self nextCard];
    }];
}

- (IBAction)dismiss {
    [self.swipeView swipeRight:^{
        [self nextCard];
    }];
}

- (IBAction)messages
{
    
}

- (IBAction)logout {
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Logout"
                                                    message:@"Are you sure you want to logout?"
                                                   delegate:self
                                          cancelButtonTitle:@"No"
                                          otherButtonTitles:@"Yes", nil];
    [alert show];
}

- (IBAction)editProfile {
    [self performSegueWithIdentifier:@"goto_edit_profile" sender:@"home"];
}


- (void)alertView:(UIAlertView *)alertView didDismissWithButtonIndex:(NSInteger)buttonIndex {
    if (buttonIndex == 1) {
        [self.navigationController popViewControllerAnimated:true];
    }
}

- (void)dragStarted
{
    self.dismissButton.enabled = false;
    self.connectButton.enabled = false;
}

- (void)updateDistance:(CGFloat)distance
{
    if (distance > 0) {
        self.directionLabel.text = @"Dismiss";
        self.directionLabel.textColor = [UIColor colorWithRed:0.7 green:0 blue:0 alpha:0.8];
    } else if (distance <= 0) {
        self.directionLabel.text = @"Connect";
        self.directionLabel.textColor = [UIColor colorWithRed:0.2 green:0.5 blue:0.1 alpha:0.8];
    }
    CGFloat overlayStrength = MIN(fabs(distance) / 60, 1.0);
    NSLog(@"alpha: %f", overlayStrength);
    self.directionLabel.alpha = overlayStrength;
}

- (void)dragComplete:(CGFloat)distance
{
    NSLog(@"complete: %f", distance);
    if (distance >= 80) {
        [self dismiss];
    } else if (distance <= -80) {
        [self connect];
    } else {
        [UIView animateWithDuration:0.2
                         animations:^{
                             self.directionLabel.alpha = 0;
                         }
         ];
        [self.swipeView returnToOrigin:^{
            self.directionLabel.alpha = 0;
            self.connectButton.enabled = true;
            self.dismissButton.enabled = true;
        }];
    }
}

- (void)loadJobs:(void (^)())success
         failure:(void (^)())failure
{
    self.loading = true;
    [self.appDelegate.api loadJobsWithExclusions:self.seen
                                         success:^(NSArray *jobs) {
                                             @synchronized(self) {
                                                 self.lastLoad = [jobs count];
                                                 [self.jobs addObjectsFromArray:jobs];
                                                 self.loading = false;
                                                 NSMutableArray *ids = [[NSMutableArray alloc] init];
                                                 for (Job *job in jobs)
                                                     [ids addObject:job.id];
                                                 [self.seen addObjectsFromArray:ids];
                                                 NSLog(@"loaded: %@", [ids componentsJoinedByString:@", "]);
                                                 success();
                                             }
                                         }
                                         failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                             [[[UIAlertView alloc] initWithTitle:@"Error"
                                                                         message:@"Error loading jobs"
                                                                        delegate:self
                                                               cancelButtonTitle:@"Okay"
                                                               otherButtonTitles:nil] show];
                                             @synchronized(self) {
                                                 self.loading = false;
                                                 failure();
                                             }
                                         }
     ];
}

- (void)nextCard
{
    @synchronized(self) {
        self.job = nil;
        if ([self.jobs count] > 0) {
            self.job = self.jobs.firstObject;
            [self.jobs removeObject:self.job];
        }
        if ([self.jobs count] < 5 && !self.loading) {
            if (self.lastLoad > 0) {
                if (self.job) {
                    [self loadJobs:^{} failure:^{}];
                } else {
                    [self loadJobs:^{
                        [self nextCard];
                    } failure:^{}];
                }
            }
        }
        if (self.job) {
            [self showProgress:false];
            self.nameLabel.text = self.job.title;
            self.descriptionLabel.text = self.job.desc;
            Hours *hours = [self.appDelegate getHours:self.job.hours];
            Contract *contract = [self.appDelegate getContract:self.job.contract];
            if ([contract isEqual:[self.appDelegate getContractByName:CONTRACT_PERMANENT]])
                self.extraLabel.text = hours.name;
            else
                self.extraLabel.text = [NSString stringWithFormat:@"%@ (%@)", hours.name, contract.shortName];
            self.connectButton.enabled = true;
            self.dismissButton.enabled = true;
            self.directionLabel.alpha = 0;
            [self.swipeView nextCard:^{}];
        } else if (self.loading) {
            [self showProgress:true];
        } else {
            // TODO show reset menu
            NSLog(@"out");
        }
    }
}

@end
