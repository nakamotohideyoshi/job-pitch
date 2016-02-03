//
//  CreateProfile.h
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "ScrollingViewController.h"
#import "JobSeekerProfileView.h"
#import "BusinessEditView.h"

@interface CreateProfile : ScrollingViewController<JobSeekerProfileViewDelegate> {
    __weak IBOutlet JobSeekerProfileView *jobSeekerProfile;
    __weak IBOutlet UIView *recruiterProfile;
    __weak IBOutlet BusinessEditView *businessEditView;
    __weak IBOutlet NSLayoutConstraint *recruiterBottomContraint;
}

- (IBAction)logout;
- (IBAction)showJobSeeker;
- (IBAction)showRecruiter;

@end
