//
//  ErrorTextField.h
//  My Job Pitch
//
//  Created by user on 03/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>

IB_DESIGNABLE
@interface ErrorTextField : UIView
@property (weak, nonatomic) IBOutlet UITextField *textField;
@property (weak, nonatomic) IBOutlet UILabel *errorLabel;

@property (nullable, nonatomic) IBInspectable NSString *error;
@property (nullable, nonatomic) IBInspectable NSString *placeholder;
@property (nullable, nonatomic) IBInspectable NSString *keyboardType;
@end
