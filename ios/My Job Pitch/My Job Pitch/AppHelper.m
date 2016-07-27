//
//  MyAlertController.m
//  MyJobPitch
//
//  Created by dev on 6/13/16.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "AppHelper.h"

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

@end
