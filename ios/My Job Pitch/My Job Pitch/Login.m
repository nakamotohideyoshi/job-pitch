//
//  ViewController.m
//  My Job Pitch
//
//  Created by user on 22/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "Login.h"
#import "AppDelegate.h"

@interface Login ()

@end

@implementation Login
{
    bool isAutoLogin;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    [activityIndicator setHidden:YES];
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    BOOL isRemember = [defaults boolForKey:@"remember"];
    username.text = [defaults stringForKey:@"username"];
    password.text = isRemember ? [defaults stringForKey:@"password"] : @"";
    password2.text = @"";
    [switchRemember setOn:isRemember];
    
    if (isRemember) {
        isAutoLogin = YES;
        [self login:nil];
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewWillAppear:(BOOL)animated {
    
//    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
//    BOOL isRemember = [defaults boolForKey:@"remember"];
//    username.text = [defaults stringForKey:@"username"];
//    password.text = isRemember ? [defaults stringForKey:@"password"] : @"";
//    password2.text = @"";
//    [switchRemember setOn:isRemember];
    
    [[self appDelegate].api logout];
    [[self appDelegate] clearData];
    
    [self clearErrors];
    registrationForm.hidden = YES;
    loginForm.alpha = 1.0f;
    self.navigationController.navigationBarHidden = YES;
    
    if (isAutoLogin) {
        isAutoLogin = NO;
    } else {
        [self showProgress:false];
    }
}

- (void)viewDidDisappear:(BOOL)animated
{
    self.navigationController.navigationBarHidden = NO;
}

- (void)completeLoginWithUser:(User*)user {
    [self.view endEditing:YES];
    [self clearErrors];
    [self appDelegate].user = user;
    [self.appDelegate loadData:^() {
        
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
        
        [defaults setBool:switchRemember.isOn forKey:@"remember"];
        [defaults setObject:username.text forKey:@"username"];
        [defaults setObject:password.text forKey:@"password"];
        [defaults synchronize];
        
        if ([user isRecruiter]) {
            [self performSegueWithIdentifier:@"goto_recruiter" sender:@"login"];
        } else if ([user isJobSeeker]) {
            [self performSegueWithIdentifier:@"goto_job_seeker" sender:@"login"];
        } else {
            [self performSegueWithIdentifier:@"goto_create_profile" sender:@"login"];
        }
    } failure:^(NSDictionary *errors, NSString *message) {
        [self handleErrors:errors message:message];
        [self showProgress:false];
    }];
}

- (NSMutableDictionary *)performValidation
{
    NSMutableDictionary *errors = [super performValidation];
    if (!registrationForm.hidden) {
        NSMutableArray *passwordErrors = errors[@"password"];
        if (!passwordErrors) {
            passwordErrors = [@[] mutableCopy];
        }
        if (password.text.length < 6) {
            [passwordErrors addObject:@"Password must be at least 6 characters long."];
        } else if (![password.text isEqualToString:password2.text]) {
            [passwordErrors addObject:@"Passwords must match."];
        }
        if ([passwordErrors count]) {
            errors[@"password"] = passwordErrors;
        }
    }
    return errors;
}

- (NSArray *)getRequiredFields {
    if (registrationForm.hidden) {
        return @[@"username", @"password"];
    } else {
        return @[@"username", @"password", @"password2"];
    }
}

- (NSDictionary*)getFieldMap {
    return @{@"username": username,
             @"password": password,
             @"password2": password2,
             };
}

- (NSDictionary *)getErrorViewMap {
    return @{@"username": usernameError,
             @"password": passwordError,
             @"password2": password2Error,
             };
}

- (IBAction)login:(id)sender {
    NSLog(@"login");
    if ([self validate]) {
        [self showProgress:true];
        [[self appDelegate].api loginWithUsername:username.text password:password.text success:^(AuthToken *authToken) {
            [[self appDelegate].api getUser:^(User *user) {
                [self completeLoginWithUser:user];
            } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                [self handleErrors:errors message:message];
                [self showProgress:false];
            }];
        } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
            [self handleErrors:errors message:message];
            [self showProgress:false];
        }];
    }
}

- (IBAction)register:(id)sender {
    NSLog(@"register");
    if ([self validate]) {
        [self showProgress:true];
        [[self appDelegate].api registerWithUsername:username.text password1:password.text password2:password2.text success:^(AuthToken *authToken) {
            [[self appDelegate].api loginWithUsername:username.text password:password.text success:^(AuthToken *authToken) {
                [[self appDelegate].api getUser:^(User *user) {
                    password.text = @"";
                    password2.text = @"";
                    [switchRemember setOn:NO];
                    [self completeLoginWithUser:user];
                } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                    [self handleErrors:errors message:message];
                    [self showProgress:false];
                }];
            } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                [self handleErrors:errors message:message];
                [self showProgress:false];
            }];
        } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
            [self handleErrors:errors message:message];
            [self showProgress:false];
        }];
    }
}

- (IBAction)registrationForm:(id)sender {
    NSLog(@"registrationForm");
    [UIView animateWithDuration:0.5f animations:^{
        [loginForm setAlpha:0.0f];
    } completion:^(BOOL finished) {
        registrationForm.alpha = 0.0f;
        registrationForm.hidden = NO;
        [UIView animateWithDuration:0.5f animations:^{
            [registrationForm setAlpha:1.0f];
        } completion:nil];
    }];
}

- (IBAction)registrationCancel:(id)sender {
    [UIView animateWithDuration:0.5f animations:^{
        [registrationForm setAlpha:0.0f];
    } completion:^(BOOL finished) {
        registrationForm.hidden = YES;
        [UIView animateWithDuration:0.5f animations:^{
            [loginForm setAlpha:1.0f];
        } completion:nil];
    }];
}

@end
