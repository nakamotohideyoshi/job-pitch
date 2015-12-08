//
//  CreateProfile.h
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "ScrollingViewController.h"
#import "JobSeekerProfileView.h"

@interface CreateProfile<JobSeekerProfileViewDelegate> : ScrollingViewController {
    __weak IBOutlet JobSeekerProfileView *jobSeekerProfile;
}

- (IBAction)logout;
- (IBAction)showJobSeeker;
- (IBAction)showRecruiter;

@end
