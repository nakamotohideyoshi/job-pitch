//
//  HowViewController.h
//  MyJobPitch
//
//  Created by dev on 11/11/16.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "CreateProfile.h"

@interface HowViewController : UIViewController

@property (weak, nonatomic) CreateProfile *createProfile;
@property BOOL isJobSeeker;

@end
