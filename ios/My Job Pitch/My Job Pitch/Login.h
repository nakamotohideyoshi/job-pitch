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
    
    __weak IBOutlet UITextField * email;
    __weak IBOutlet UILabel * emailError;
    __weak IBOutlet UITextField * password;
    __weak IBOutlet UILabel * passwordError;
    __weak IBOutlet UITextField * password2;
    __weak IBOutlet UILabel * password2Error;
    __weak IBOutlet UIView * loginForm;
    __weak IBOutlet UIView * registrationForm;
    __weak IBOutlet UISwitch *switchRemember;
}

@end
