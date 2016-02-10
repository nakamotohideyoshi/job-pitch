//
//  LocationEditView.m
//  My Job Pitch
//
//  Created by user on 09/02/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "LocationEditView.h"

@interface LocationEditView ()
@property (nullable) Image *image;
@end

@implementation LocationEditView

- (instancetype)initWithCoder:(NSCoder *)aDecoder
{
    if (self = [super initWithCoder:aDecoder]) {
        
        [self xibSetup];
    }
    return self;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {;
        [self xibSetup];
    }
    return self;
}

- (void)xibSetup
{
    UIView *view = [self loadViewFromNib];
    view.frame = self.bounds;
    view.autoresizingMask = UIViewAutoresizingFlexibleWidth|UIViewAutoresizingFlexibleHeight;
    [self addSubview:view];
    
    self.changeCenterContraint.priority = UILayoutPriorityDefaultHigh;
    self.deleteButton.hidden = true;
    self.noImage.hidden = false;
    self.imageActivity.hidden = true;
}

- (UIView*)loadViewFromNib
{
    NSBundle *bundle = [NSBundle bundleForClass:[self class]];
    UINib *nib = [UINib nibWithNibName:@"LocationEditView" bundle:bundle];
    return [[nib instantiateWithOwner:self options:nil] objectAtIndex:0];
}

- (void)load:(nonnull Location*)location
{
    self.name.textField.text = location.name;
    self.desc.textField.text = location.desc;
    self.address.textField.text = location.address;
    self.email.textField.text = location.email;
    self.emailPublic.on = location.emailPublic;
    self.telephone.textField.text = location.telephone;
    self.telephonePublic.on = location.telephonePublic;
    self.mobile.textField.text = location.mobile;
    self.mobilePublic.on = location.mobilePublic;
    
    self.locationLabel.text = location.placeName;
    
    self.image = [location getImage];
    if (self.image && self.image.image) {
        [self.imageActivity setHidden:false];
        [self.imageActivity startAnimating];
        self.imageView.image = nil;
        self.changeButton.enabled = false;
        self.changeButton.alpha = 0.5;
        self.changeCenterContraint.priority = UILayoutPriorityDefaultLow;
        self.deleteButton.hidden = false;
        self.deleteButton.enabled = false;
        self.deleteButton.alpha = 0.5;
        NSURL *imageURL = [NSURL URLWithString:self.image.image];
        [NSURLConnection sendAsynchronousRequest:[NSURLRequest requestWithURL:imageURL]
                                           queue:[NSOperationQueue mainQueue]
                               completionHandler:^(NSURLResponse *response, NSData *data, NSError *error) {
                                   self.imageView.image = [UIImage imageWithData:data];
                                   [self.imageActivity setHidden:true];
                                   [self.imageActivity stopAnimating];
                                   self.deleteButton.enabled = true;
                                   self.deleteButton.alpha = 1.0;
                                   self.changeButton.enabled = true;
                                   self.changeButton.alpha = 1.0;
                               }];
    } else {
        self.changeCenterContraint.priority = UILayoutPriorityDefaultHigh;
        self.deleteButton.hidden = true;
        self.noImage.hidden = false;
        self.imageActivity.hidden = true;
    }
}

- (void)save:(nonnull Location*)location
{
    location.name = self.name.textField.text;
    location.desc = self.desc.textField.text;
    location.address = self.address.textField.text;
    location.email = self.email.textField.text;
    location.emailPublic = self.emailPublic.on;
    location.telephone = self.telephone.textField.text;
    location.telephonePublic = self.telephonePublic.on;
    location.mobile = self.mobile.textField.text;
    location.mobilePublic = self.mobilePublic.on;
}

- (IBAction)changeImage:(id)sender {
}

- (IBAction)deleteImage:(id)sender {
    self.image = nil;
    self.imageView.image = nil;
    self.changeCenterContraint.priority = UILayoutPriorityDefaultHigh;
    self.deleteButton.hidden = true;
    self.noImage.hidden = false;
}

- (IBAction)changeLocation:(id)sender {
}
@end
