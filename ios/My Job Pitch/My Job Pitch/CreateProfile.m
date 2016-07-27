//
//  CreateProfile.m
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "CreateProfile.h"
#import "CreateRecruiterProfile.h"
#import "MyAlertController.h"
#import "ChangePassword.h"
#import "KxMenu.h"

@implementation CreateProfile

- (void)viewWillAppear:(BOOL)animated
{
    activityIndicator.hidden = YES;
}

- (IBAction)account:(id)sender {
    [KxMenu setTintColor: [UIColor colorWithRed:247/255.0f green:247/255.0f blue:247/255.0f alpha:1.0]];
    NSArray *menuItems =
    @[
      
      [KxMenuItem menuItem:@"Change Password"
                     image:nil
                    target:self
                    action:@selector(changePassword)],
      [KxMenuItem menuItem:@"Logout"
                     image:nil
                    target:self
                    action:@selector(logout)],
      ];
    
    [KxMenu showMenuInView:self.view
                  fromRect:CGRectMake(0, 20, 50, 44)
                 menuItems:menuItems];
}

- (void)changePassword {
    ChangePassword *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"ChangePassword"];
    [self presentViewController:controller animated:YES completion:nil];
}

- (void)logout {
    [MyAlertController title:@"Logout" message:@"Are you sure you want to logout?" ok:@"Yes" okCallback:^{
        [self.navigationController popViewControllerAnimated:true];
    } cancel:@"No" cancelCallback:nil];
}

- (void)showJobSeeker {
    NSLog(@"showJobSeeker");
    [self performSegueWithIdentifier:@"goto_create_job_seeker_profile" sender:self];
    
}

- (void)showRecruiter {
    NSLog(@"showRecruiter");
    
    CreateRecruiterProfile *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"CreateRecruiterProfile"];
    controller.isFirst = YES;
    [self.navigationController pushViewController:controller animated:YES];
}

@end
