//
//  CreateRecruiterProfile.h
//  My Job Pitch
//
//  Created by user on 09/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ScrollingViewController.h"

@interface CreateRecruiterProfile : ScrollingViewController

@property BOOL hiddenBusiness;
@property BOOL hiddenLocation;
@property BOOL isFirst;
@property (nonatomic, nonnull) Business* business;
@property (nonatomic, nonnull) Location *location;

@end
