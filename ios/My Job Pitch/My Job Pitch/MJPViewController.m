//
//  MJPViewController.m
//  My Job Pitch
//
//  Created by user on 29/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "MJPViewController.h"

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
                [[[UIAlertView alloc] initWithTitle:[NSString stringWithFormat:@"Error: %@", key]
                                            message:[errors[key] firstObject]
                                           delegate:nil
                                  cancelButtonTitle:@"OK"
                                  otherButtonTitles:nil, nil] show];
            }
        }
    }
    if (message) {
        [[[UIAlertView alloc] initWithTitle:@"Error"
                                    message:message
                                   delegate:nil
                          cancelButtonTitle:@"OK"
                          otherButtonTitles:nil, nil] show];
    }
}

@end
