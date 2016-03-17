//
//  JobDetails.h
//  My Job Pitch
//
//  Created by user on 29/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ScrollingViewController.h"
#import "Job.h"

@interface JobDetails : ScrollingViewController

@property (nonnull) Application *application;
@property (nonnull) Job *job;

@property (weak, nonatomic) IBOutlet UIImageView *jobImage;
@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *jobImageActivity;
@property (weak, nonatomic) IBOutlet UILabel *jobTitle;
@property (weak, nonatomic) IBOutlet UILabel *attributes;
@property (weak, nonatomic) IBOutlet UILabel *jobBusinessLocation;
@property (weak, nonatomic) IBOutlet UILabel *jobDescription;
@property (weak, nonatomic) IBOutlet UILabel *locationName;
@property (weak, nonatomic) IBOutlet UILabel *locationDescription;
@property (weak, nonatomic) IBOutlet UILabel *contactDetails;
@property (weak, nonatomic) IBOutlet UIButton *messagesButton;

- (IBAction)openMap:(nullable id)sender;

@end
