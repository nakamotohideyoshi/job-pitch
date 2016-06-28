//
//  CreateRecruiterProfile.h
//  My Job Pitch
//
//  Created by user on 09/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>

#import "ScrollingViewController.h"
#import "BusinessEditView.h"
#import "LocationEditView.h"

@interface CreateRecruiterProfile : ScrollingViewController

@property (weak, nonatomic) IBOutlet UILabel *activityLabel;

@property (nonatomic, nonnull) Business* business;
@property (nonatomic, nonnull) Location *location;

@property BOOL hiddenBusiness;
@property BOOL hiddenLocation;

- (void)load:(nonnull Business*)business;

- (IBAction)continue;

@end
