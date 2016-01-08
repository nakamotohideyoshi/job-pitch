//
//  EditProfile.h
//  My Job Pitch
//
//  Created by user on 07/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ScrollingViewController.h"
#import "JobSeekerProfileView.h"

@interface EditProfile : ScrollingViewController<JobSeekerProfileViewDelegate> {
    __weak IBOutlet JobSeekerProfileView *jobSeekerProfile;
}

@end
