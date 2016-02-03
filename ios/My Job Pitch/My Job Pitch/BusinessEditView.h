//
//  CompanyEditView.h
//  My Job Pitch
//
//  Created by user on 03/02/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "Business.h"
#import "ErrorTextField.h"

@interface BusinessEditView : UIView

@property (weak, nonatomic) IBOutlet ErrorTextField *companyName;
@property (weak, nonatomic) IBOutlet UIImageView *imageView;
@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *imageActivity;
@property (weak, nonatomic) IBOutlet UILabel *noImage;
@property (weak, nonatomic) IBOutlet UIButton *changeButton;
@property (weak, nonatomic) IBOutlet UIButton *deleteButton;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *changeCenterContraint;

- (void)load:(nonnull Business*)business;
- (void)save:(nonnull Business*)business;

@end
