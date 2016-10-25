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

+ (NSString*) getData:(NSString*)key {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    return [defaults stringForKey:key];
}

+ (void) setData:(NSString*)key value:(NSString*)value {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    [defaults setObject:value forKey:key];
    [defaults synchronize];
}

+ (NSString*) getEmail {
    return [AppHelper getData:@"email"];
}

+ (void) setEmail:(NSString*)email {
    [AppHelper setData:@"email" value:email];
}

+ (NSString*) getPassword {
    return [AppHelper getData:@"password"];
}

+ (void) setPassword:(NSString*)password {
    [AppHelper setData:@"password" value:password];
}

+ (UIViewController*) getCurrentVC {
    UIViewController *vc = [UIApplication sharedApplication].keyWindow.rootViewController;
    if ([vc isKindOfClass:[UINavigationController class]]) {
        vc = ((UINavigationController*)vc).topViewController;
    }
    while (vc.presentedViewController) {
        vc = vc.presentedViewController;
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
    [MyAlertController title:nil message:@"This will log you out. Are you sure?" ok:@"Cancel" okCallback:nil cancel:@"Logout" cancelCallback:^{
        [currentVC.navigationController popViewControllerAnimated:true];
    }];
}


@end
