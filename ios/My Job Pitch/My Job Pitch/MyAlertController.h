//
//  MyAlertController.h
//  MyJobPitch
//
//  Created by dev on 6/13/16.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface MyAlertController : UIAlertController

+ (void)title:(NSString*)title message:(NSString*)message
           ok:(NSString*)ok okCallback:(void(^)())okCallback
       cancel:(NSString*)cancel cancelCallback:(void(^)())cancelCallback;

+ (void)showError:(NSString*)message callback:(void(^)())callback;

@end
