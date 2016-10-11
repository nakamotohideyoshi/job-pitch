//
//  ViewJob.m
//  My Job Pitch
//
//  Created by user on 13/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ViewJob.h"
#import "MessageThread.h"
#import "JobSeekerDetails.h"

typedef NS_ENUM(NSInteger, EmptyButtonAction) {
    EmptyButtonActionNone,
    EmptyButtonActionReset,
    EmptyButtonActionTurnOffShortlist,
    EmptyButtonActionGotoSearchMode,
    EmptyButtonActionGotoApplicationsMode,
    EmptyButtonActionGotoConnectionsMode,
};

@interface ViewJob ()
@property (nonnull) NSMutableArray* objects;
@property (nonnull) NSMutableArray* seen;
@property (nullable) JobSeeker* jobSeeker;
@property (nullable) Application* application;
@property NSUInteger lastLoad;
@property Boolean loading;
@property EmptyButtonAction emptyButton1Action;
@property EmptyButtonAction emptyButton2Action;
@property EmptyButtonAction emptyButton3Action;
@end

@implementation ViewJob {
    Boolean resetOnAppearance;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    resetOnAppearance = true;
    self.swipeView.delegate = self;
    self.emptyButton1Action = EmptyButtonActionNone;
    self.emptyButton2Action = EmptyButtonActionNone;
    self.emptyButton3Action = EmptyButtonActionNone;
    self.shortlisted.on = false;
    self.navigationItem.title = self.strTitle;
}

- (IBAction)cardTapAction:(id)sender
{
    [self performJobSeekerDetails];
}

- (void)viewWillAppear:(BOOL)animated
{
    NSNumber *orientation = [NSNumber numberWithInt: UIInterfaceOrientationPortrait];
    [[UIDevice currentDevice] setValue:orientation forKey:@"orientation"];
    if (resetOnAppearance)
        [self reset];
    resetOnAppearance = true;
}

- (IBAction)emptyButton1ActionDelegate:(id)sender
{
    [self performEmptyButtonAction:self.emptyButton1Action];
}

- (IBAction)emptyButton2ActionDelegate:(id)sender
{
    [self performEmptyButtonAction:self.emptyButton2Action];
}

- (IBAction)emptyButton3ActionDelegate:(id)sender
{
    [self performEmptyButtonAction:self.emptyButton3Action];
}

- (void)performEmptyButtonAction:(EmptyButtonAction)action
{
    switch (action) {
        case EmptyButtonActionReset:
            [self reset];
            break;
        case EmptyButtonActionTurnOffShortlist:
            self.shortlisted.on = false;
            [self reset];
            break;
        case EmptyButtonActionGotoSearchMode:
            self.mode = JobViewModeSearch;
            [self reset];
            break;
        case EmptyButtonActionGotoApplicationsMode:
            self.mode = JobViewModeApplications;
            [self reset];
            break;
        case EmptyButtonActionGotoConnectionsMode:
            self.mode = JobViewModeConnections;
            [self reset];
            break;
        case EmptyButtonActionNone:
        default:
            break;
    }
}

- (void)reset
{
    [SVProgressHUD show];
    self.objects = [[NSMutableArray alloc] init];
    self.seen = [[NSMutableArray alloc] init];
    self.application = nil;
    self.jobSeeker = nil;
    self.lastLoad = 999;
    self.swipeView.alpha = 0.0;
    self.swipeContainer.hidden = false;
    self.emptyView.hidden = true;
    if (self.mode == JobViewModeConnections || self.mode == JobViewModeMyShort) {
        self.leftTitle.text = @"Messages";
        self.leftIcon.image = [UIImage imageNamed:@"ic_email_blue"];
        self.rightTitle.text = @"Remove";
        self.shortlisted.hidden = self.mode == JobViewModeMyShort;
        self.shortlistedLabel.hidden = self.mode == JobViewModeMyShort;
        self.shortlistButton.hidden = self.mode == JobViewModeMyShort;
        self.shortlistButtonIcon.hidden = self.mode == JobViewModeMyShort;
    } else {
        self.leftTitle.text = @"Connect";
        self.leftIcon.image = [UIImage imageNamed:@"ic_connect"];
        self.rightTitle.text = @"Remove";
        self.shortlisted.hidden = true;
        self.shortlistedLabel.hidden = true;
        self.shortlistButton.hidden = true;
        self.shortlistButtonIcon.hidden = true;
    }
    [self.appDelegate.api
     loadJobWithId:self.job.id
     success:^(Job *job) {
         self.job = job;
         self.tokensLabel.text = [NSString stringWithFormat:@"%d Credit", self.job.locationData.businessData.tokens.intValue];
         [SVProgressHUD dismiss];
         [self nextCard];
     } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
         [MyAlertController showError:@"Error loading data" callback:nil];
     }];
}

- (void)loadData:(void (^)())successCallback
         failure:(void (^)())failureCallback
{
    self.loading = true;
    void (^success)(NSArray *objects) = ^(NSArray *objects) {
        @synchronized(self) {
            [self.objects addObjectsFromArray:objects];
            self.loading = false;
            NSMutableArray *ids = [[NSMutableArray alloc] init];
            for (MJPObject *object in objects)
                [ids addObject:object.id];
            [self.seen addObjectsFromArray:ids];
            NSLog(@"loaded: %@", [ids componentsJoinedByString:@", "]);
            successCallback();
        }
    };
    void (^failure)(RKObjectRequestOperation*, NSError*, NSString*, NSDictionary*) = ^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        [MyAlertController showError:@"Error loading job seekers" callback:nil];
        @synchronized(self) {
            self.loading = false;
            failureCallback();
        }
    };
    if (self.mode == JobViewModeSearch) {
        [self.appDelegate.api searchJobSeekersForJob:self.job
                                          exclusions:self.seen
                                             success:^(NSArray *jobSeekers) {
                                                 self.lastLoad = [jobSeekers count];
                                                 success(jobSeekers);
                                             }
                                             failure:failure];
    } else if (self.mode == JobViewModeApplications) {
        [self.appDelegate.api loadApplicationsForJob:self.job
                                              status:[self.appDelegate
                                                      getApplicationStatusByName:APPLICATION_CREATED].id
                                         shortlisted:false
                                             success:^(NSArray *jobSeekers) {
                                                 self.lastLoad = 0;
                                                 success(jobSeekers);
                                             }
                                             failure:failure];
    } else if (self.mode == JobViewModeConnections || self.mode == JobViewModeMyShort) {
        [self.appDelegate.api loadApplicationsForJob:self.job
                                              status:[self.appDelegate
                                                      getApplicationStatusByName:APPLICATION_ESTABLISHED].id
                                         shortlisted:self.shortlisted.on || self.mode == JobViewModeMyShort
                                             success:^(NSArray *jobSeekers) {
                                                 self.lastLoad = 0;
                                                 success(jobSeekers);
                                             }
                                             failure:failure];
    }
}

- (void)nextCard
{
    @synchronized(self) {
        self.application = nil;
        self.jobSeeker = nil;
        if ([self.objects count] > 0) {
            if (self.mode == JobViewModeSearch) {
                self.jobSeeker = self.objects.firstObject;
                [self.objects removeObject:self.jobSeeker];
                [self.objects addObject:self.jobSeeker];
            } else {
                self.application = self.objects.firstObject;
                self.jobSeeker = self.application.jobSeeker;
                [self.objects removeObject:self.application];
                [self.objects addObject:self.application];
            }
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
            
            if(self.mode == JobViewModeConnections) {
                self.shortlistIcon.hidden = false;
                self.shortlistButtonIcon.image = [UIImage imageNamed:@"ic_star_remove"];
            } else {
                self.shortlistIcon.hidden = true;
                self.shortlistButtonIcon.image = [UIImage imageNamed:@"ic_star"];
            }
            
            self.leftButton.enabled = true;
            self.rightButton.enabled = true;
            self.shortlisted.enabled = true;
            self.directionLabel.alpha = 0;
            [self.swipeView nextCard:^{}];
        } else if (self.lastLoad > 0) {
            [SVProgressHUD show];
        } else {
            if (self.mode == JobViewModeSearch) {
                [self.emptyLabel setText:@"There are no more potential candidates that match this job. You can switch to application mode or connections to see the people who have connected with you, or restart the search."];
                [self.emptyButton1 setTitle:@"Restart search" forState:UIControlStateNormal];
                [self setEmptyButton1Action:EmptyButtonActionReset];
                [self.emptyButton2 setTitle:@"Switch to applications mode" forState:UIControlStateNormal];
                [self setEmptyButton2Action:EmptyButtonActionGotoApplicationsMode];
                [self.emptyButton3 setTitle:@"Switch to connections mode" forState:UIControlStateNormal];
                [self setEmptyButton3Action:EmptyButtonActionGotoConnectionsMode];
                [self.emptyButton3 setHidden:false];
            } else if (self.mode == JobViewModeApplications) {
                [self.emptyLabel setText:@"No candidates have yet expressed an interest in this job. Once that happens, you will be able to sort through them from here. You can switch to search mode to look for potential applicants or switch to connections mode to view job seekers you've already connected with."];
                [self.emptyButton1 setTitle:@"Restart search" forState:UIControlStateNormal];
                [self setEmptyButton1Action:EmptyButtonActionReset];
                [self.emptyButton2 setTitle:@"Switch to search mode" forState:UIControlStateNormal];
                [self setEmptyButton2Action:EmptyButtonActionGotoSearchMode];
                [self.emptyButton3 setTitle:@"Switch to connections mode" forState:UIControlStateNormal];
                [self setEmptyButton3Action:EmptyButtonActionGotoConnectionsMode];
                [self.emptyButton3 setHidden:false];
            } else if (self.mode == JobViewModeConnections || self.mode == JobViewModeMyShort) {
                if (self.shortlisted.on || self.mode == JobViewModeMyShort) {
                    [self.emptyLabel setText:@"You have not shortlisted any applications for this job, turn off shortlist view to see the non-shortlisted applications."];
                    [self.emptyButton1 setTitle:@"Restart search" forState:UIControlStateNormal];
                    [self setEmptyButton1Action:EmptyButtonActionReset];
                    [self.emptyButton2 setTitle:@"Turn off shortlist" forState:UIControlStateNormal];
                    [self setEmptyButton2Action:EmptyButtonActionTurnOffShortlist];
                    [self.emptyButton3 setHidden:true];
                } else {
                    [self.emptyLabel setText:@"You have not chosen anyone to connect with for this job. Once that happens, you will be able to sort through them from here. You can switch to search mode to look for potential applicants or applications mode to look at job seekers who have applied."];
                    [self.emptyButton1 setTitle:@"Restart search" forState:UIControlStateNormal];
                    [self setEmptyButton1Action:EmptyButtonActionReset];
                    [self.emptyButton2 setTitle:@"Switch to search mode" forState:UIControlStateNormal];
                    [self setEmptyButton2Action:EmptyButtonActionGotoSearchMode];
                    [self.emptyButton3 setTitle:@"Switch to applications mode" forState:UIControlStateNormal];
                    [self setEmptyButton3Action:EmptyButtonActionGotoApplicationsMode];
                    [self.emptyButton3 setHidden:false];
                }
            }
            [self.swipeContainer setHidden:true];
            [self.emptyView setHidden:false];
        }
        
        if ([self.objects count] < 5 && !self.loading && self.lastLoad > 0) {
            [self loadData:^{
                [SVProgressHUD dismiss];
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
    self.shortlisted.enabled = false;
}

- (void)updateDistance:(CGFloat)distance
{
    if (self.mode == JobViewModeConnections || self.mode == JobViewModeMyShort) {
        self.directionLabel.text = @"Next";
        self.directionLabel.textColor = [UIColor colorWithRed:0.2 green:0.5 blue:0.1 alpha:0.8];
    } else {
        if (distance > 0) {
            self.directionLabel.text = @"Dismiss";
            self.directionLabel.textColor = [UIColor colorWithRed:0.7 green:0 blue:0 alpha:0.8];
        } else if (distance <= 0) {
            self.directionLabel.text = @"Connect";
            self.directionLabel.textColor = [UIColor colorWithRed:0.2 green:0.5 blue:0.1 alpha:0.8];
        }
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
            self.shortlisted.enabled = true;
        }];
    }
}

- (IBAction)leftClick:(id)sender {
    if (self.mode == JobViewModeConnections || self.mode == JobViewModeMyShort) {
        [self performMessages];
    } else {
        [self left];
    }
}

- (IBAction)rightClick:(id)sender {
    NSString *title = [NSString stringWithFormat:@"Remove %@ %@?", self.jobSeeker.firstName, self.jobSeeker.lastName];
    [MyAlertController title:title
                     message:@"This job seeker will never appear again for this job. If you want this item to appear again in this list, just swipe to the right to remove temporarily."
                          ok:@"Okay"
                  okCallback:^{
                      if (self.mode == JobViewModeSearch) {
                          // TODO permanenty exclude
                      } else {
                          [self.objects removeObject:self.application];
                          [self.appDelegate.api deleteApplication:self.application
                                                          success:^(Application *application) {
                                                              NSLog(@"Application deleted: %@", application);
                                                          } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                                              [MyAlertController showError:@"Error deleting application!" callback:nil];
                                                          }
                           ];
                      }
                      [self right];
                  }
                      cancel:@"Cancel" cancelCallback:nil];
}

- (void)left {
    self.leftButton.enabled = false;
    self.rightButton.enabled = false;
    self.shortlisted.enabled = false;
    if (self.mode == JobViewModeSearch) {
        [self.objects removeObject:self.jobSeeker];
        ApplicationForCreation *application = [ApplicationForCreation alloc];
        application.job = self.job.id;
        application.jobSeeker = self.jobSeeker.id;
        application.shortlisted = false;
        [self.appDelegate.api createApplication:application
                                        success:^(ApplicationForCreation *application) {
                                            NSLog(@"Application created %@", application);
                                        } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                            if (errors[@"NO_TOKENS"]) {
                                                [SVProgressHUD dismiss];
                                                [MyAlertController title:nil
                                                                 message:@"out off credit!"
                                                                      ok:@"Okay"
                                                              okCallback:nil
                                                                  cancel:nil
                                                          cancelCallback:nil];
                                            } else {
                                                [MyAlertController showError:@"Error creating application!" callback:nil];
                                            }
                                        }];
    } else if (self.mode == JobViewModeApplications) {
        [self.objects removeObject:self.application];
        ApplicationStatusUpdate *update = [ApplicationStatusUpdate alloc];
        update.id = self.application.id;
        update.status = [self.appDelegate getApplicationStatusByName:APPLICATION_ESTABLISHED].id;
        [self.appDelegate.api updateApplicationStatus:update
                                        success:^(ApplicationStatusUpdate *update) {
                                            NSLog(@"Application updated %@", update);
                                        }
                                        failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                            [MyAlertController showError:@"Error updating application!" callback:nil];
                                        }];
    }
    [self.swipeView swipeLeft:^{
        [self nextCard];
    }];
}

- (void)right {
    self.leftButton.enabled = false;
    self.rightButton.enabled = false;
    self.shortlisted.enabled = false;
    if (self.mode == JobViewModeSearch)
        [self.objects removeObject:self.jobSeeker];
    else if (self.mode == JobViewModeApplications)
        [self.objects removeObject:self.application];
    [self.swipeView swipeRight:^{
        [self nextCard];
    }];
}

- (IBAction)shortlistClick:(id)sender {
    self.leftButton.enabled = false;
    self.rightButton.enabled = false;
    self.shortlisted.enabled = false;
    self.shortlistButtonIcon.image = [UIImage imageNamed:@"ic_star_disabled"];
    ApplicationShortlistUpdate *update = [ApplicationShortlistUpdate alloc];
    update.id = self.application.id;
    update.shortlisted = !self.application.shortlisted;
    [self.appDelegate.api updateApplicationShortlist:update
                                          success:^(ApplicationShortlistUpdate *update) {
                                              self.shortlistIcon.hidden = !update.shortlisted;
                                              self.application.shortlisted = update.shortlisted;
                                              self.leftButton.enabled = true;
                                              self.rightButton.enabled = true;
                                              self.shortlisted.enabled = true;
                                              if (update.shortlisted)
                                                  self.shortlistButtonIcon.image = [UIImage imageNamed:@"ic_star_remove"];
                                              else
                                                  self.shortlistButtonIcon.image = [UIImage imageNamed:@"ic_star"];
                                              if (self.shortlisted.on) {
                                                  [self.objects removeObject:self.application];
                                                  [self right];
                                              }
                                          }
                                          failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                              [MyAlertController showError:@"Error updating application!" callback:nil];
                                              self.leftButton.enabled = true;
                                              self.rightButton.enabled = true;
                                              self.shortlisted.enabled = true;
                                          }
     ];
}

- (void)performJobSeekerDetails
{
    resetOnAppearance = false;
    [self performSegueWithIdentifier:@"goto_job_seeker_details" sender:@"view_job"];
}

- (void)performMessages
{
    resetOnAppearance = false;
    [self performSegueWithIdentifier:@"goto_message_thread" sender:@"view_job"];
}

- (IBAction)shortlistedChanged:(id)sender {
    [self reset];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    if ([[segue identifier] isEqualToString:@"goto_job_seeker_details"]) {
        JobSeekerDetails *jobSeekerDetailsView = [segue destinationViewController];
        [jobSeekerDetailsView setJobSeeker:self.jobSeeker];
        [jobSeekerDetailsView setApplication:self.application];
    } else if ([[segue identifier] isEqualToString:@"goto_message_thread"]) {
        MessageThread *messageThreadView = [segue destinationViewController];
        [messageThreadView setApplication:self.application];
    }
}

- (UIInterfaceOrientationMask)supportedInterfaceOrientations
{
    return UIInterfaceOrientationMaskPortrait;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation {
    return UIInterfaceOrientationIsPortrait(toInterfaceOrientation);
}

- (UIInterfaceOrientation)preferredInterfaceOrientationForPresentation
{
    return UIInterfaceOrientationPortrait;
}

@end
