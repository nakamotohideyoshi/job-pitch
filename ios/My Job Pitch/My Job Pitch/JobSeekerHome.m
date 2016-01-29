//
//  JobSeekerHome.m
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "JobSeekerHome.h"
#import "EditSearchProfile.h"
#import "Application.h"

typedef NS_ENUM(NSInteger, EmptyButtonAction) {
    EmptyButtonActionNone,
    EmptyButtonActionReset,
    EmptyButtonActionSetupProfile,
    EmptyButtonActionRecordPitch,
    EmptyButtonActionActivateProfile,
};

@interface JobSeekerHome ()
@property (nonnull) NSMutableArray* jobs;
@property (nonnull) NSMutableArray* seen;
@property (nullable) Job* job;
@property (nullable) JobSeeker* jobSeeker;
@property NSUInteger lastLoad;
@property Boolean loading;
@property EmptyButtonAction emptyButton1Action;
@property EmptyButtonAction emptyButton2Action;
@end

@implementation JobSeekerHome

- (void)viewDidLoad {
    [super viewDidLoad];
    self.swipeView.delegate = self;
    self.emptyButton1Action = EmptyButtonActionNone;
    self.emptyButton2Action = EmptyButtonActionNone;
}

- (IBAction)emptyButton1ActionDelegate:(id)sender
{
    [self performEmptyButtonAction:self.emptyButton1Action];
}

- (IBAction)emptyButton2ActionDelegate:(id)sender
{
    [self performEmptyButtonAction:self.emptyButton2Action];
}

- (void)performEmptyButtonAction:(EmptyButtonAction)action
{
    switch (action) {
        case EmptyButtonActionReset:
            [self reset];
            break;
        case EmptyButtonActionActivateProfile:
            [self performActivateProfile];
            break;
        case EmptyButtonActionRecordPitch:
            [self performRecordPitch];
            break;
        case EmptyButtonActionSetupProfile:
            [self performEditSearch];
            break;
        case EmptyButtonActionNone:
        default:
            break;
    }
}

- (void)viewWillAppear:(BOOL)animated
{
    [self reset];
    [self.navigationController setToolbarHidden:NO animated:YES];
}

- (void)viewWillDisappear:(BOOL)animated
{
    [self.navigationController setToolbarHidden:YES animated:YES];
}

- (void)reset
{
    [self showProgress:true];
    self.jobs = [[NSMutableArray alloc] init];
    self.seen = [[NSMutableArray alloc] init];
    self.job = nil;
    self.lastLoad = 999;
    self.swipeView.alpha = 0.0;
    [self.appDelegate.api
     loadJobSeekerWithId:self.appDelegate.user.jobSeeker
     success:^(JobSeeker *jobSeeker) {
         self.jobSeeker = jobSeeker;
         if (jobSeeker.profile == nil && jobSeeker.pitches.count == 0) {
             [self.emptyLabel setText:@"You have not yet setup your job preferences or recorded your pitch, once we have this information, you will see job matches here, and potential employers will be able to find you."];
             [self.emptyButton1 setHidden:false];
             [self.emptyButton1 setTitle:@"Setup Profile" forState:UIControlStateNormal];
             [self setEmptyButton1Action:EmptyButtonActionSetupProfile];
             [self.emptyButton2 setHidden:false];
             [self.emptyButton2 setTitle:@"Record my pitch" forState:UIControlStateNormal];
             [self setEmptyButton2Action:EmptyButtonActionRecordPitch];
             [self.swipeContainer setHidden:true];
             [self.emptyView setHidden:false];
         } else if (jobSeeker.profile == nil) {
             [self.emptyLabel setText:@"You have not yet setup your job preferences, once we know your search criteria, you will see job matches here, and potential employers will be able to find you."];
             [self.emptyButton1 setHidden:false];
             [self.emptyButton1 setTitle:@"Setup Profile" forState:UIControlStateNormal];
             [self setEmptyButton1Action:EmptyButtonActionSetupProfile];
             [self.emptyButton2 setHidden:true];
             [self setEmptyButton2Action:EmptyButtonActionNone];
             [self.swipeContainer setHidden:true];
             [self.emptyView setHidden:false];
         } else if (jobSeeker.pitches.count == 0) {
             [self.emptyLabel setText:@"You have not yet recorded your pitch, once we have this, you will see job matches here, and potential employers will be able to find you."];
             [self.emptyButton1 setHidden:false];
             [self.emptyButton1 setTitle:@"Record my pitch" forState:UIControlStateNormal];
             [self setEmptyButton1Action:EmptyButtonActionRecordPitch];
             [self.emptyButton2 setHidden:true];
             [self setEmptyButton2Action:EmptyButtonActionNone];
             [self.swipeContainer setHidden:true];
             [self.emptyView setHidden:false];
         } else if (!jobSeeker.active) {
             [self.emptyLabel setText:@"Your profile is currently inactive. The means you are hidden from prospective employers and cannot search for jobs."];
             [self.emptyButton1 setHidden:false];
             [self.emptyButton1 setTitle:@"Activate my profile" forState:UIControlStateNormal];
             [self setEmptyButton1Action:EmptyButtonActionActivateProfile];
             [self.emptyButton2 setHidden:true];
             [self setEmptyButton2Action:EmptyButtonActionNone];
             [self.swipeContainer setHidden:true];
             [self.emptyView setHidden:false];
         } else {
             [self.swipeContainer setHidden:false];
             [self.emptyView setHidden:true];
             [self nextCard];
         }
         [self showProgress:false];
     } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
         [[[UIAlertView alloc] initWithTitle:@"Error"
                                     message:@"Error loading data"
                                    delegate:self
                           cancelButtonTitle:@"Okay"
                           otherButtonTitles:nil] show];
     }];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)connect {
    self.dismissButton.enabled = false;
    self.connectButton.enabled = false;
    ApplicationForCreation *application = [ApplicationForCreation alloc];
    application.job = self.job.id;
    application.jobSeeker = self.jobSeeker.id;
    application.shortlisted = false;
    [self.appDelegate.api createApplication:application
                                    success:^(ApplicationForCreation *application) {
                                        NSLog(@"Application created %@", application);
                                    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                        [[[UIAlertView alloc] initWithTitle:@"Error"
                                                                    message:@"Error creating application!"
                                                                   delegate:nil
                                                          cancelButtonTitle:@"OK"
                                                          otherButtonTitles:nil] show];
                                    }];
    [self.swipeView swipeLeft:^{
        [self nextCard];
    }];
}

- (IBAction)dismiss {
    self.dismissButton.enabled = false;
    self.connectButton.enabled = false;
    [self.swipeView swipeRight:^{
        [self nextCard];
    }];
}

- (IBAction)messages
{
    [self performMessages];
}

- (IBAction)logout {
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Logout"
                                                    message:@"Are you sure you want to logout?"
                                                   delegate:self
                                          cancelButtonTitle:@"No"
                                          otherButtonTitles:@"Yes", nil];
    [alert show];
}

- (IBAction)editProfile
{
    [self performEditProfile];
}

- (IBAction)editSearch
{
    [self performEditSearch];
}

- (IBAction)editSearch:(id)sender {
}

- (void)performEditProfile
{
    [self performSegueWithIdentifier:@"goto_edit_profile" sender:@"home"];
}

- (void)performEditSearch
{
    [self performSegueWithIdentifier:@"goto_edit_search" sender:@"home"];
}

- (void)performRecordPitch
{
    [self performSegueWithIdentifier:@"goto_record_pitch" sender:@"home"];
}

- (void)performMessages
{
    [self performSegueWithIdentifier:@"goto_messages" sender:@"home"];
}

- (void)performActivateProfile
{
    self.jobSeeker.active = true;
    [self showProgress:true];
    [self.appDelegate.api saveJobSeeker:self.jobSeeker
                                success:^(JobSeeker *jobSeeker) {
                                    [self reset];
                                } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                    [[[UIAlertView alloc] initWithTitle:@"Error"
                                                                message:@"Error activating profile"
                                                               delegate:self
                                                      cancelButtonTitle:@"Okay"
                                                      otherButtonTitles:nil] show];
                                    [self showProgress:false];
                                }];
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
        if (self.job) {
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
        } else if (self.lastLoad > 0) {
            [self showProgress:true];
        } else {
            [self.emptyLabel setText:@"There are no more jobs that match your profile. You can restart the search to restore all the jobs you\'ve dismissed, or go to the message centre to check the status of your applications."];
            [self.emptyButton1 setHidden:false];
            [self.emptyButton1 setTitle:@"Restart search" forState:UIControlStateNormal];
            [self setEmptyButton1Action:EmptyButtonActionReset];
            [self.emptyButton2 setHidden:true];
            [self setEmptyButton2Action:EmptyButtonActionNone];
            [self.swipeContainer setHidden:true];
            [self.emptyView setHidden:false];
        }
        
        if ([self.jobs count] < 5 && !self.loading && self.lastLoad > 0) {
            [self loadJobs:^{
                [self showProgress:false];
                if (self.job == nil)
                    [self nextCard];
            } failure:^{}];
        }
    }
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    if ([[segue identifier] isEqualToString:@"goto_edit_search"]) {
        EditSearchProfile *editSearchProfileView = [segue destinationViewController];
        [editSearchProfileView setProfileId:self.jobSeeker.profile];
    }
}

@end
