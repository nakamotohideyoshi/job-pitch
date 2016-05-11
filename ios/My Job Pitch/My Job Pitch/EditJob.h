//
//  EditJob.h
//  My Job Pitch
//
//  Created by user on 13/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ScrollingViewController.h"
#import "JobEditView.h"

@interface EditJob : ScrollingViewController {
    __weak IBOutlet JobEditView *jobEditView;
}

@property (nonatomic, nonnull) Location *location;
@property (nonatomic, nonnull) Job *job;
@property (weak, nonatomic) IBOutlet UILabel *activityLabel;

- (IBAction)continue:(nullable id)sender;

@end