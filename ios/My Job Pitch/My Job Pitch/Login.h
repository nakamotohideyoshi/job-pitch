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
    IBOutlet UILabel * usernameError;
    IBOutlet UITextField * password;
    IBOutlet UILabel * passwordError;
    IBOutlet UITextField * password2;
    IBOutlet UILabel * password2Error;
    IBOutlet UIView * loginForm;
    IBOutlet UIView * registrationForm;
}

@end
