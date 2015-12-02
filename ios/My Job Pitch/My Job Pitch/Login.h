//
//  ViewController.h
//  My Job Pitch
//
//  Created by user on 22/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "MJPViewController.h"
#import "ScrollingViewController.h"

@interface Login : ScrollingViewController {
    
    IBOutlet UITextField * username;
    IBOutlet UITextView * usernameError;
    IBOutlet UITextField * password;
    IBOutlet UITextView * passwordError;
    IBOutlet UITextField * password2;
    IBOutlet UIView * loginForm;
    IBOutlet UIView * registrationForm;
    IBOutlet UIActivityIndicatorView * activityIndicator;
    IBOutlet NSLayoutConstraint *passwordErrorHeightConstraint;
    IBOutlet NSLayoutConstraint *usernameErrorHeightConstraint;
}

@end

