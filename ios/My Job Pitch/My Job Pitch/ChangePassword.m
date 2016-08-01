//
//  CreateRecruiterProfile.m
//  My Job Pitch
//
//  Created by user on 09/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ChangePassword.h"

@interface ChangePassword ()

@property (weak, nonatomic) IBOutlet UITextField *currentPassword;
@property (weak, nonatomic) IBOutlet UITextField *password1;
@property (weak, nonatomic) IBOutlet UITextField *password2;
@property (weak, nonatomic) IBOutlet UILabel *currentPassError;
@property (weak, nonatomic) IBOutlet UILabel *passError;

@end

@implementation ChangePassword {
    NSString *oldPassword;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    oldPassword = [AppHelper getPassword];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
}

- (void)viewWillAppear:(BOOL)animated {
    activityIndicator.hidden = YES;
}

- (NSArray *)getRequiredFields {
    return @[@"old_password", @"new_password1", @"new_password2"];
}

- (NSDictionary*)getFieldMap {
    return @{@"old_password": _currentPassword,
             @"new_password1": _password1,
             @"new_password2": _password2,
             };
}

- (NSDictionary *)getErrorViewMap {
    return @{@"old_password": _currentPassError,
             @"new_password1": _passError,
             @"new_password2": _passError,
             };
}

- (IBAction)change:(id)sender {
    if ([self validate]) {
        
        if(![oldPassword isEqualToString:_currentPassword.text]) {
            _currentPassError.text = @"your old password was incorrect.";
            return;
        }
        
        [SVProgressHUD show];
        [self.view endEditing:YES];
        [[self appDelegate].api changePassword:[AppHelper getEmail] password1:_password1.text password2:_password2.text success:^{
            [AppHelper setPassword:_password1.text];
            [SVProgressHUD dismiss];
            [self cancel:nil];
        } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
            [self handleErrors:errors message:message];
            [SVProgressHUD dismiss];
        }];
    }
}

- (IBAction)cancel:(id)sender {
    [self dismissViewControllerAnimated:YES completion:nil];
}

@end
