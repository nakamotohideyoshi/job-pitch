//
//  JobSeekerDetails.h
//  My Job Pitch
//
//  Created by user on 17/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ScrollingViewController.h"

@interface JobSeekerDetails : ScrollingViewController

@property (weak, nonatomic) Application *application;
@property (weak, nonatomic) JobSeeker *jobSeeker;

@property (weak, nonatomic) IBOutlet UIImageView *jobSeekerImage;
@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *jobSeekerImageActivity;
@property (weak, nonatomic) IBOutlet UILabel *name;
@property (weak, nonatomic) IBOutlet UILabel *attributes;
@property (weak, nonatomic) IBOutlet UILabel *desc;
@property (weak, nonatomic) IBOutlet UILabel *contactDetails;
@property (weak, nonatomic) IBOutlet UIButton *messagesButton;

@property (weak, nonatomic) IBOutlet UIView *cvView;
@property (weak, nonatomic) IBOutlet UILabel *lblReferencesAvailable;
@property (weak, nonatomic) IBOutlet UIButton *cvButton;

@end
