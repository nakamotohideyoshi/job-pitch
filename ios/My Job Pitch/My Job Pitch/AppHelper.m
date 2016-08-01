//
//  MyAlertController.m
//  MyJobPitch
//
//  Created by dev on 6/13/16.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "AppHelper.h"
#import "KxMenu.h"
#import "ChangePassword.h"

@interface AppHelper ()

@end

@implementation AppHelper

+ (NSString*) getEmail {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    return [defaults stringForKey:@"email"];
}

+ (void) setEmail:(NSString*)email {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setObject:email forKey:@"email"];
    [defaults synchronize];
}

+ (NSString*) getPassword {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    return [defaults stringForKey:@"password"];
}

+ (void) setPassword:(NSString*)password {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setObject:password forKey:@"password"];
    [defaults synchronize];
}


+ (UIViewController*) getCurrentVC {
    UIViewController *vc = [UIApplication sharedApplication].keyWindow.rootViewController;
    if ([vc isKindOfClass:[UINavigationController class]]) {
        vc = ((UINavigationController*)vc).topViewController;
    }
    return vc;
}

+ (void) showAccountMenu {
    
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
    
    
    [KxMenu showMenuInView:[AppHelper getCurrentVC].view
                  fromRect:CGRectMake(0, 20, 50, 44)
                 menuItems:menuItems];
    
}

+ (void)changePassword {
    UIViewController *currentVC = [AppHelper getCurrentVC];
    ChangePassword *controller = [currentVC.storyboard instantiateViewControllerWithIdentifier:@"ChangePassword"];
    [currentVC presentViewController:controller animated:YES completion:nil];
}

+ (void)logout {
    UIViewController *currentVC = [AppHelper getCurrentVC];
    [MyAlertController title:@"Logout" message:@"Are you sure you want to logout?" ok:@"Yes" okCallback:^{
        [currentVC.navigationController popViewControllerAnimated:true];
    } cancel:@"No" cancelCallback:nil];
}


@end
