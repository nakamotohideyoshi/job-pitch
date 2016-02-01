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

- (nonnull AppDelegate*)appDelegate;
- (nonnull NSArray*) getRequiredFields;
- (nonnull NSDictionary*)getFieldMap;
- (nonnull NSDictionary*)getErrorViewMap;
- (void)clearErrors;
- (void)handleErrors:(nullable NSDictionary*)errors message:(nullable NSString*)message;
- (void)showProgress:(BOOL)showProgress;
- (BOOL)validate;
- (nonnull NSMutableDictionary*)performValidation;
- (void)loadImageURL:(nonnull NSString*)image into:(nonnull UIImageView*)imageView withIndicator:(nonnull UIActivityIndicatorView*)indicator;

@end

