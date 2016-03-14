//
//  ViewJob.m
//  My Job Pitch
//
//  Created by user on 13/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ViewJob.h"

typedef NS_ENUM(NSInteger, EmptyButtonAction) {
    EmptyButtonActionNone,
    EmptyButtonActionReset,
};

@interface ViewJob ()
@property (nonnull) NSMutableArray* jobSeekers;
@property (nonnull) NSMutableArray* seen;
@property (nullable) JobSeeker* jobSeeker;
@property NSUInteger lastLoad;
@property Boolean loading;
@property EmptyButtonAction emptyButton1Action;
@end

@implementation ViewJob {
    Boolean resetOnAppearance;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    resetOnAppearance = true;
    self.swipeView.delegate = self;
    self.emptyButton1Action = EmptyButtonActionNone;
}

- (IBAction)cardTapAction:(id)sender
{
    [self performJobSeekerDetails];
}

- (void)viewWillAppear:(BOOL)animated
{
    if (resetOnAppearance)
        [self reset];
    resetOnAppearance = true;
}

- (IBAction)emptyButton1ActionDelegate:(id)sender
{
    [self performEmptyButtonAction:self.emptyButton1Action];
}

- (void)performEmptyButtonAction:(EmptyButtonAction)action
{
    switch (action) {
        case EmptyButtonActionReset:
            [self reset];
            break;
        case EmptyButtonActionNone:
        default:
            break;
    }
}

- (void)reset
{
    [self showProgress:true];
    self.jobSeekers = [[NSMutableArray alloc] init];
    self.seen = [[NSMutableArray alloc] init];
    self.jobSeeker = nil;
    self.lastLoad = 999;
    self.swipeView.alpha = 0.0;
    self.swipeContainer.hidden = false;
    self.emptyView.hidden = true;
    [self.appDelegate.api
     loadJobWithId:self.job.id
     success:^(Job *job) {
         self.job = job;
         [self showProgress:false];
         [self nextCard];
     } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
         [[[UIAlertView alloc] initWithTitle:@"Error"
                                     message:@"Error loading data"
                                    delegate:self
                           cancelButtonTitle:@"Okay"
                           otherButtonTitles:nil] show];
     }];
}

- (void)loadJobSeekers:(void (^)())success
         failure:(void (^)())failure
{
    self.loading = true;
    if (self.mode == JobViewModeSearch) {
        [self.appDelegate.api
         searchJobSeekersForJob:self.job
         exclusions:self.seen
         success:^(NSArray *jobSeekers) {
             @synchronized(self) {
                 self.lastLoad = [jobSeekers count];
                 [self.jobSeekers addObjectsFromArray:jobSeekers];
                 self.loading = false;
                 NSMutableArray *ids = [[NSMutableArray alloc] init];
                 for (JobSeeker *jobSeeker in jobSeekers)
                     [ids addObject:jobSeeker.id];
                 [self.seen addObjectsFromArray:ids];
                 NSLog(@"loaded: %@", [ids componentsJoinedByString:@", "]);
                 success();
             }
         }
         failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
             [[[UIAlertView alloc] initWithTitle:@"Error"
                                         message:@"Error loading job seekers"
                                        delegate:self
                               cancelButtonTitle:@"Okay"
                               otherButtonTitles:nil] show];
             @synchronized(self) {
                 self.loading = false;
                 failure();
             }
         }];
    }
}

- (void)nextCard
{
    @synchronized(self) {
        self.jobSeeker = nil;
        if ([self.jobSeekers count] > 0) {
            self.jobSeeker = self.jobSeekers.firstObject;
            [self.jobSeekers removeObject:self.jobSeeker];
        }
        if (self.jobSeeker) {
            Pitch *pitch = [self.jobSeeker.pitches firstObject];
            self.image.image = nil;
            if (pitch)
                [self loadImageURL:pitch.thumbnail into:self.image withIndicator:self.imageActivity];
            self.nameLabel.text = [NSString stringWithFormat:@"%@ %@", self.jobSeeker.firstName, self.jobSeeker.lastName];
            self.descriptionLabel.text = self.jobSeeker.desc;
            Sex *sex = nil;
            if (self.jobSeeker.sex)
                sex = [self.appDelegate getSex:self.jobSeeker.sex];
            if (sex && self.jobSeeker.sexPublic && self.jobSeeker.age && self.jobSeeker.agePublic) {
                self.extraLabel.text = [NSString stringWithFormat:@"%@ %@.", self.jobSeeker.age, sex.shortName];
            } else if (sex && self.jobSeeker.sexPublic) {
                self.extraLabel.text = sex.shortName;
            } else if (self.jobSeeker.age && self.jobSeeker.agePublic) {
                self.extraLabel.text = [self.jobSeeker.age stringValue];
            } else {
                self.extraLabel.text = nil;
            }
;
            self.leftButton.enabled = true;
            self.rightButton.enabled = true;
            self.directionLabel.alpha = 0;
            [self.swipeView nextCard:^{}];
        } else if (self.lastLoad > 0) {
            [self showProgress:true];
        } else {
            [self.emptyLabel setText:@"There are no more potential candidates that match this job. You can switch to application mode to see the people who have connected with you, or restart the search."];
            [self.emptyButton1 setHidden:false];
            [self.emptyButton1 setTitle:@"Restart search" forState:UIControlStateNormal];
            [self setEmptyButton1Action:EmptyButtonActionReset];
            [self.swipeContainer setHidden:true];
            [self.emptyView setHidden:false];
        }
        
        if ([self.jobSeekers count] < 5 && !self.loading && self.lastLoad > 0) {
            [self loadJobSeekers:^{
                [self showProgress:false];
                if (self.jobSeeker == nil)
                    [self nextCard];
            } failure:^{}];
        }
    }
}
- (void)dragStarted
{
    self.leftButton.enabled = false;
    self.rightButton.enabled = false;
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
    self.directionLabel.alpha = overlayStrength;
}

- (void)dragComplete:(CGFloat)distance
{
    NSLog(@"complete: %f", distance);
    if (distance >= 80) {
        [self right];
    } else if (distance <= -80) {
        [self left];
    } else {
        [UIView animateWithDuration:0.2
                         animations:^{
                             self.directionLabel.alpha = 0;
                         }
         ];
        [self.swipeView returnToOrigin:^{
            self.directionLabel.alpha = 0;
            self.leftButton.enabled = true;
            self.rightButton.enabled = true;
        }];
    }
}

- (IBAction)left {
    if (self.mode == JobViewModeSearch) {
        self.rightButton.enabled = false;
        self.leftButton.enabled = false;
        ApplicationForCreation *application = [ApplicationForCreation alloc];
        application.job = self.job.id;
        application.jobSeeker = self.jobSeeker.id;
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
    } else if (self.mode == JobViewModeApplications) {
//        ApplicationStatusUpdate *update = [ApplicationStatusUpdate alloc];
//        [self.appDelegate.api updateApplication:application]
    } else if (self.mode == JobViewModeConnections) {
        [self right];
    }
}

- (IBAction)right {
    self.leftButton.enabled = false;
    self.rightButton.enabled = false;
    [self.swipeView swipeRight:^{
        [self nextCard];
    }];
}

- (void)performJobSeekerDetails
{
    resetOnAppearance = false;
    [self performSegueWithIdentifier:@"goto_job_seeker_details" sender:@"view_job"];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    if ([[segue identifier] isEqualToString:@"goto_job_seeker_details"]) {
//        JobSeekerDetails *jobSeekerDetailsView = [segue destinationViewController];
//        [jobSeekerDetailsView setJobSeeker:self.jobSeeker];
    }
}

@end
