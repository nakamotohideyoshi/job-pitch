//
//  ReplaceSegue.m
//  My Job Pitch
//
//  Created by user on 07/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ReplaceSegue.h"

@implementation ReplaceSegue

-(void)perform {
    UIViewController *sourceViewController = (UIViewController*)[self sourceViewController];
    UIViewController *destinationController = (UIViewController*)[self destinationViewController];
    UINavigationController *navigationController = sourceViewController.navigationController;
    // Pop to root view controller (not animated) before pushing
    [navigationController pushViewController:destinationController animated:YES];
    NSMutableArray *navigationArray = [[NSMutableArray alloc] initWithArray: navigationController.viewControllers];
    [navigationArray removeObject:sourceViewController];
    navigationController.viewControllers = navigationArray;
}

@end
