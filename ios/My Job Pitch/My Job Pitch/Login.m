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

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(keyboardWasShown:)
                                                 name:UIKeyboardDidShowNotification
                                               object:nil];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(keyboardWillBeHidden:)
                                                 name:UIKeyboardWillHideNotification
                                               object:nil];
    [activityIndicator setHidden:YES];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)keyboardWasShown:(NSNotification*)aNotification
{
    NSDictionary* info = [aNotification userInfo];
    CGSize kbSize = [[info objectForKey:UIKeyboardFrameBeginUserInfoKey] CGRectValue].size;
    
    UIEdgeInsets contentInsets = UIEdgeInsetsMake(0.0, 0.0, kbSize.height, 0.0);
    scrollView.contentInset = contentInsets;
    scrollView.scrollIndicatorInsets = contentInsets;
    
    // If active text field is hidden by keyboard, scroll it so it's visible
    // Your app might not need or want this behavior.
    CGRect aRect = self.view.frame;
    aRect.size.height -= kbSize.height;
    if (!CGRectContainsPoint(aRect, activeField.frame.origin) ) {
        aRect = activeField.frame;
        aRect.size.height = aRect.size.height*2;
        [self->scrollView scrollRectToVisible:aRect animated:YES];
    }
}

- (void)keyboardWillBeHidden:(NSNotification*)aNotification
{
    UIEdgeInsets contentInsets = UIEdgeInsetsZero;
    scrollView.contentInset = contentInsets;
    scrollView.scrollIndicatorInsets = contentInsets;
}

- (void)textFieldDidBeginEditing:(UITextField *)textField
{
    activeField = textField;
}

- (void)textFieldDidEndEditing:(UITextField *)textField
{
    activeField = nil;
}

- (void)completeLogin
{
    username.hidden = NO;
    password.hidden = NO;
    usernameError.hidden = NO;
    passwordError.hidden = NO;
    loginForm.hidden = NO;
    activityIndicator.hidden = YES;
}

- (IBAction)login:(id)sender {
    NSLog(@"login");
    username.hidden = YES;
    password.hidden = YES;
    usernameError.hidden = YES;
    passwordError.hidden = YES;
    loginForm.hidden = YES;
    activityIndicator.hidden = NO;
    [activityIndicator startAnimating];
    [[self appDelegate].api loginWithUsername:username.text password:password.text success:^(AuthToken *authToken) {
        [self completeLogin];
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        NSString *errorMessage = nil;
        if (message) {
            errorMessage = message;
        } else if ([errors objectForKey:@"non_field_errors"]) {
            errorMessage = [[errors objectForKey:@"non_field_errors"] firstObject];
        }
        if ([errors objectForKey:@"username"]) {
            [usernameError setText:[[errors objectForKey:@"username"] firstObject]];
            [usernameError sizeToFit];
            usernameErrorHeightConstraint.constant = usernameError.frame.size.height;
        } else {
            usernameErrorHeightConstraint.constant = 0;
        }
        if ([errors objectForKey:@"password"]) {
            [passwordError setText:[[errors objectForKey:@"password"] firstObject]];
            [passwordError sizeToFit];
            passwordErrorHeightConstraint.constant = passwordError.frame.size.height;
        } else {
            passwordErrorHeightConstraint.constant = 0;
        }
        if (errorMessage) {
            [[[UIAlertView alloc] initWithTitle:@"Login Error"
                                        message:errorMessage
                                       delegate:nil
                              cancelButtonTitle:@"OK"
                              otherButtonTitles:nil, nil] show];
        }
        username.hidden = NO;
        password.hidden = NO;
        usernameError.hidden = NO;
        passwordError.hidden = NO;
        loginForm.hidden = NO;
        activityIndicator.hidden = YES;
        [activityIndicator stopAnimating];
    }];
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

- (IBAction)register:(id)sender {
    NSLog(@"register");
    if (password.text.length < 6) {
        [[[UIAlertView alloc] initWithTitle:nil
                                    message:@"Password must be at least 6 characters long."
                                   delegate:nil
                          cancelButtonTitle:@"OK"
                          otherButtonTitles:nil, nil] show];
    } else if (![password.text isEqualToString:password2.text]) {
        [[[UIAlertView alloc] initWithTitle:nil
                                    message:@"Passwords must match!"
                                   delegate:nil
                          cancelButtonTitle:@"OK"
                           otherButtonTitles:nil, nil] show];
    } else {
        username.hidden = YES;
        password.hidden = YES;
        usernameError.hidden = YES;
        passwordError.hidden = YES;
        registrationForm.hidden = YES;
        activityIndicator.hidden = NO;
        [activityIndicator startAnimating];
        [[self appDelegate].api registerWithUsername:username.text password1:password.text password2:password2.text success:^(User *user) {
            [[self appDelegate].api loginWithUsername:username.text password:password.text success:^(AuthToken *authToken) {
                [self completeLogin];
            } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                NSString *errorMessage = @"Unknown error";
                if (message) {
                    errorMessage = message;
                } else if ([errors objectForKey:@"non_field_errors"]) {
                    errorMessage = [[errors objectForKey:@"non_field_errors"] firstObject];
                }
                [[[UIAlertView alloc] initWithTitle:@"Login Error"
                                            message:errorMessage
                                           delegate:nil
                                  cancelButtonTitle:@"OK"
                                  otherButtonTitles:nil, nil] show];
                username.hidden = NO;
                password.hidden = NO;
                usernameError.hidden = NO;
                passwordError.hidden = NO;
                registrationForm.hidden = NO;
                activityIndicator.hidden = YES;
                [activityIndicator stopAnimating];
            }];
        } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
            NSString *errorMessage = @"Unknown error";
            if (message) {
                errorMessage = message;
            } else if ([errors objectForKey:@"username"]) {
                errorMessage = [[errors objectForKey:@"username"] firstObject];
            }
            [[[UIAlertView alloc] initWithTitle:@"Registration Error"
                                        message:errorMessage
                                       delegate:nil
                              cancelButtonTitle:@"OK"
                              otherButtonTitles:nil, nil] show];
            username.hidden = NO;
            password.hidden = NO;
            usernameError.hidden = NO;
            passwordError.hidden = NO;
            registrationForm.hidden = NO;
            activityIndicator.hidden = YES;
            [activityIndicator stopAnimating];
        }];
    }
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
