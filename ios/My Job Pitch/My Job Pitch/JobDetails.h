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

@property (weak, nonatomic) IBOutlet UILabel *jobTitle;
@property (nonnull) Job *job;

@end
