//
//  MJPViewController.h
//  My Job Pitch
//
//  Created by user on 29/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "AppDelegate.h"

@interface MJPViewController : UIViewController {
    IBOutlet UIActivityIndicatorView * activityIndicator;
    IBOutlet UIView * mainView;
}

- (AppDelegate*)appDelegate;
- (NSArray*) getRequiredFields;
- (NSDictionary*)getFieldMap;
- (NSDictionary*)getErrorViewMap;
- (void)clearErrors;
- (void)handleErrors:(NSDictionary*)errors message:(NSString*)message;
- (void)showProgress:(BOOL)showProgress;
- (BOOL)validate;
- (NSMutableDictionary*)performValidation;
@end

