//
//  ViewController.h
//  My Job Pitch
//
//  Created by user on 22/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface Login : UIViewController {
    
    IBOutlet UITextField * username;
    IBOutlet UITextField * password;
    IBOutlet UITextField * password2;
    IBOutlet UIButton * loginButton;
    IBOutlet UIButton * registrationFormButton;
    IBOutlet UIButton * registrationCancelButton;
    IBOutlet UIButton * registerButton;
    IBOutlet UIView * loginForm;
    IBOutlet UIView * registrationForm;
    IBOutlet UIActivityIndicatorView * activityIndicator;
    IBOutlet UIScrollView * scrollView;
    
@private
    UITextField * activeField;
}

@end

