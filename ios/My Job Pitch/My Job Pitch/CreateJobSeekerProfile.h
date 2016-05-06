//
//  CreateJobSeekerProfile.h
//  My Job Pitch
//
//  Created by user on 09/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ScrollingViewController.h"
#import "JobSeekerProfileView.h"

@interface CreateJobSeekerProfile : ScrollingViewController<JobSeekerProfileViewDelegate> {
    __weak IBOutlet JobSeekerProfileView *jobSeekerProfile;
}

@end
