//
//  EditSearchProfile.h
//  My Job Pitch
//
//  Created by user on 27/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ScrollingViewController.h"
#import "JobSeekerSearchProfileView.h"

@interface EditSearchProfile : ScrollingViewController<JobSeekerSearchProfileViewDelegate> {
    __weak IBOutlet JobSeekerSearchProfileView *jobSeekerSearchProfile;
}

@property (nonnull) NSNumber *profileId;

@end
