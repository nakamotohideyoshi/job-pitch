//
//  AppHelper.h
//  MyJobPitch
//
//  Created by dev on 6/13/16.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface AppHelper : NSObject

+ (NSString*) getData:(NSString*)key;
+ (void) setData:(NSString*)key value:(NSString*)value;

+ (NSString*) getEmail;
+ (void) setEmail:(NSString*)email;

+ (NSString*) getPassword;
+ (void) setPassword:(NSString*)password;

+ (UIViewController*) getCurrentVC;

+ (void) showAccountMenu;
+ (void)changePassword;
+ (void)logout;

@end
