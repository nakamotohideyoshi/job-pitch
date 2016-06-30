//
//  EditJob.h
//  My Job Pitch
//
//  Created by user on 13/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ScrollingViewController.h"
#import "JobEditView.h"

@interface EditJob : ScrollingViewController

@property (nonatomic, nonnull) Job *job;
@property (nonatomic, nonnull) Location *location;

@end