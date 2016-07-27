//
//  LockableNavigationController.m
//  My Job Pitch
//
//  Created by user on 16/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "LockableNavigationController.h"

@interface LockableNavigationController ()

@end

@implementation LockableNavigationController

- (UIInterfaceOrientationMask)supportedInterfaceOrientations
{
    return [self.visibleViewController supportedInterfaceOrientations];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation
{
    return [self.visibleViewController shouldAutorotateToInterfaceOrientation:toInterfaceOrientation];
}

- (UIInterfaceOrientation)preferredInterfaceOrientationForPresentation
{
    return [self.visibleViewController preferredInterfaceOrientationForPresentation];
}

@end
