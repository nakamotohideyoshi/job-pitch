//
//  ViewController.m
//  My Job Pitch
//
//  Created by user on 22/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "Login.h"
#import "AppDelegate.h"
#import "ListLocations.h"

@interface Login ()

@end

@implementation Login

- (void)viewDidLoad {
    [super viewDidLoad];
    
    email.text = [AppHelper getEmail];
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    BOOL isRemember = [defaults boolForKey:@"remember"];
    password.text = isRemember ? [AppHelper getPassword] : @"";
    password2.text = @"";
    [switchRemember setOn:isRemember];
    
    if (isRemember) {
        [self login:nil];
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewWillAppear:(BOOL)animated {
    
    [[self appDelegate].api logout];
    [[self appDelegate] clearData];
    
    [self clearErrors];
    registrationForm.hidden = YES;
    loginForm.alpha = 1.0f;
    wantToResetButton.alpha = 1.0f;
    self.navigationController.navigationBarHidden = YES;
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    BOOL isRemember = [defaults boolForKey:@"remember"];
    email.text = [AppHelper getEmail];
    password.text = isRemember ? [AppHelper getPassword] : @"";
    password2.text = @"";
}

- (void)viewDidDisappear:(BOOL)animated
{
    self.navigationController.navigationBarHidden = NO;
}

- (void)completeLoginWithUser:(User*)user {
    
    //user.canCreateBusinesses = YES;
    
    [self.view endEditing:YES];
    [self clearErrors];
    [self appDelegate].user = user;
    [self.appDelegate loadData:^() {
        
        [AppHelper setEmail:email.text];
        [AppHelper setPassword:password.text];
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
        [defaults setBool:switchRemember.isOn forKey:@"remember"];
        [defaults synchronize];
        
        [SVProgressHUD dismiss];
        if ([user isRecruiter]) {
            if (user.canCreateBusinesses) {
                [self performSegueWithIdentifier:@"goto_business_list" sender:@"login"];
            } else {
                [SVProgressHUD show];
                [self.appDelegate.api loadBusiness:user.businesses[0] success:^(Business *business) {
                    [SVProgressHUD dismiss];
                    ListLocations *listLocations = [self.storyboard instantiateViewControllerWithIdentifier:@"listLocations"];
                    listLocations.business = business;
                    [self.navigationController pushViewController:listLocations animated:YES];
                } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                    [MyAlertController showError:@"Error loading data" callback:nil];
                }];
            }
        } else if ([user isJobSeeker]) {
            [self performSegueWithIdentifier:@"goto_job_seeker" sender:@"login"];
        } else {
            [self performSegueWithIdentifier:@"goto_create_profile" sender:@"login"];
        }
    } failure:^(NSDictionary *errors, NSString *message) {
        [self handleErrors:errors message:message];
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
    if (!registrationForm.hidden) {
        return @[@"email", @"password", @"password2"];
    } else if (!resetForm.hidden) {
        return @[@"email"];
    } else {
        return @[@"email", @"password"];
    }
}

- (NSDictionary*)getFieldMap {
    return @{@"email": email,
             @"password": password,
             @"password2": password2,
             };
}

- (NSDictionary *)getErrorViewMap {
    return @{@"email": emailError,
             @"password": passwordError,
             @"password2": password2Error,
             };
}

- (IBAction)login:(id)sender {
    NSLog(@"login");
    if ([self validate]) {
        [SVProgressHUD show];
        [[self appDelegate].api loginWithEmail:email.text password:password.text success:^(AuthToken *authToken) {
            [[self appDelegate].api getUser:^(User *user) {
                [self completeLoginWithUser:user];
            } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                [self handleErrors:errors message:message];
            }];
        } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
            [self handleErrors:errors message:message];
        }];
    }
}

- (IBAction)register:(id)sender {
    NSLog(@"register");
    if ([self validate]) {
        [SVProgressHUD show];
        [[self appDelegate].api registerWithEmail:email.text password1:password.text password2:password2.text success:^(AuthToken *authToken) {
            [[self appDelegate].api loginWithEmail:email.text password:password.text success:^(AuthToken *authToken) {
                [[self appDelegate].api getUser:^(User *user) {
                    password.text = @"";
                    password2.text = @"";
                    [switchRemember setOn:NO];
                    [self completeLoginWithUser:user];
                } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                    [self handleErrors:errors message:message];
                }];
            } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                [self handleErrors:errors message:message];
            }];
        } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
            [self handleErrors:errors message:message];
        }];
    }
}

- (IBAction)registrationForm:(id)sender {
    NSLog(@"registrationForm");
    [UIView animateWithDuration:0.5f animations:^{
        [loginForm setAlpha:0.0f];
        [wantToResetButton setAlpha:0.0f];
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
            [wantToResetButton setAlpha:1.0f];
        } completion:nil];
    }];
}

- (IBAction)resetForm:(id)sender {
    NSLog(@"resetForm");
    [UIView animateWithDuration:0.5f animations:^{
        [loginForm setAlpha:0.0f];
        [wantToResetButton setAlpha:0.0f];
        [password setAlpha:0.0f];
        [passwordError setAlpha:0.0f];
    } completion:^(BOOL finished) {
        resetForm.alpha = 0.0f;
        resetForm.hidden = NO;
        [UIView animateWithDuration:0.5f animations:^{
            [resetForm setAlpha:1.0f];
        } completion:nil];
    }];
}

- (IBAction)resetCancel:(id)sender {
    [UIView animateWithDuration:0.5f animations:^{
        [resetForm setAlpha:0.0f];
    } completion:^(BOOL finished) {
        resetForm.hidden = YES;
        [UIView animateWithDuration:0.5f animations:^{
            [loginForm setAlpha:1.0f];
            [wantToResetButton setAlpha:1.0f];
            [password setAlpha:1.0f];
            [passwordError setAlpha:1.0f];
        } completion:nil];
    }];
}

- (IBAction)reset:(id)sender {
    NSLog(@"reset");
    if ([self validate]) {
        [SVProgressHUD show];
        [[self appDelegate].api resetPassword:email.text success:^{
            [SVProgressHUD dismiss];
            [self resetCancel:nil];
        } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
            [self handleErrors:errors message:message];
        }];
    }
}


@end
