//
//  MJPViewController.m
//  My Job Pitch
//
//  Created by user on 29/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "MJPViewController.h"

#import "MyAlertController.h"

@interface MJPViewController ()


@end

@implementation MJPViewController

- (AppDelegate*)appDelegate
{
    return (AppDelegate *)[[UIApplication sharedApplication] delegate];
}

- (void)showProgress:(BOOL)showProgress
{
    if (showProgress) {
        mainView.hidden = YES;
        activityIndicator.hidden = NO;
        [activityIndicator startAnimating];
    } else {
        mainView.hidden = NO;
        activityIndicator.hidden = YES;
        [activityIndicator stopAnimating];
    }
}

- (NSArray*) getRequiredFields
{
    return @[];
}

- (NSDictionary*)getFieldMap
{
    return @{};
}

- (NSDictionary*)getErrorViewMap
{
    return @{};
}

- (NSMutableDictionary*)performValidation
{
    NSDictionary *fieldMap = [self getFieldMap];
    NSMutableDictionary *errors = [@{} mutableCopy];
    for (id key in [self getRequiredFields]) {
        if ([fieldMap objectForKey:key]) {
            UITextField *field = fieldMap[key];
            if (field) {
                NSString *text = [field.text
                        stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
                if ([text isEqualToString:@""]) {
                    NSMutableArray *keyErrors;
                    if (errors[key]) {
                        keyErrors = [errors[key] mutableCopy];
                    } else {
                        keyErrors = [@[] mutableCopy];
                    }
                    [keyErrors addObject:@"This field is required."];
                    errors[key] = keyErrors;
                }
            }
        }
    }
    return errors;
}

- (BOOL)validate {
    NSDictionary *errors = [self performValidation];
    [self handleErrors:errors message:nil];
    return [errors count] == 0;
}

- (void)clearErrors
{
    [self handleErrors:nil message:nil];
}

- (void)handleErrors:(NSDictionary*)errors message:(NSString*)message {
    NSDictionary *errorViewMap = [self getErrorViewMap];
    for (id key in errorViewMap) {
        UILabel *view = errorViewMap[key];
        [view setText:nil];
    }
    if (errors) {
        for (id key in errors) {
            UILabel *errorText = errorViewMap[key];
            if (errorText) {
                if ([errors objectForKey:key]) {
                    [errorText setText:[errors[key] firstObject]];
                }
            } else {
                NSString *title;
                if ([key isEqualToString:@"non_field_errors"])
                    title = @"Error";
                else
                    title = [NSString stringWithFormat:@"Error: %@", key];
                
                [MyAlertController title:title message:[errors[key] firstObject] ok:@"OK" okCallback:nil cancel:nil cancelCallback:nil];
            }
        }
    }
    if (message) {
        [MyAlertController title:@"Error" message:message ok:@"OK" okCallback:nil cancel:nil cancelCallback:nil];
    }
}

- (void)loadImageURL:(NSString*)image
                into:(UIImageView*)imageView
       withIndicator:(UIActivityIndicatorView*)indicator
{
    [self loadImageURL:image into:imageView withIndicator:indicator completion:nil];
}

- (void)loadImageURL:(NSString*)image
                into:(UIImageView*)imageView
       withIndicator:(UIActivityIndicatorView*)indicator
          completion:(void (^)())completion
{
    [indicator setHidden:false];
    [indicator startAnimating];
    imageView.image = nil;
    NSURL *imageURL = [NSURL URLWithString:image];
    [NSURLConnection sendAsynchronousRequest:[NSURLRequest requestWithURL:imageURL]
                                       queue:[NSOperationQueue mainQueue]
                           completionHandler:^(NSURLResponse *response, NSData *data, NSError *error) {
                               if (imageView.image == nil) {
                                   imageView.image = [UIImage imageWithData:data];
                               }
                               [indicator setHidden:true];
                               [indicator stopAnimating];
                               if (completion)
                                   completion();
                           }];
}

@end
