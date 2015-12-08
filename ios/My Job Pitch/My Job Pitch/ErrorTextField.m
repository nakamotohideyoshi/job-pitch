//
//  ErrorTextField.m
//  My Job Pitch
//
//  Created by user on 03/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "ErrorTextField.h"

@implementation ErrorTextField

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

- (void)setError:(NSString *)error
{
    [self.errorLabel setText:error];
}

- (void)setPlaceholder:(NSString *)placeholder
{
    [self.textField setPlaceholder:placeholder];    
}

-(void)setKeyboardType:(NSString*)stringType
{
    UIKeyboardType keyboardType = UIKeyboardTypeDefault;
    if ([stringType isEqualToString:@"UIKeyboardTypeASCIICapable"])
        keyboardType = UIKeyboardTypeASCIICapable;
    else if ([stringType isEqualToString:@"UIKeyboardTypeNumbersAndPunctuation"])
        keyboardType = UIKeyboardTypeNumbersAndPunctuation;
    else if ([stringType isEqualToString:@"UIKeyboardTypeURL"])
        keyboardType = UIKeyboardTypeURL;
    else if ([stringType isEqualToString:@"UIKeyboardTypeNumberPad"])
        keyboardType = UIKeyboardTypeNumberPad;
    else if ([stringType isEqualToString:@"UIKeyboardTypePhonePad"])
        keyboardType = UIKeyboardTypePhonePad;
    else if ([stringType isEqualToString:@"UIKeyboardTypeNamePhonePad"])
        keyboardType = UIKeyboardTypePhonePad;
    else if ([stringType isEqualToString:@"UIKeyboardTypeEmailAddress"])
        keyboardType = UIKeyboardTypeEmailAddress;
    else if ([stringType isEqualToString:@"UIKeyboardTypeDecimalPad"])
        keyboardType = UIKeyboardTypeDecimalPad;
    else if ([stringType isEqualToString:@"UIKeyboardTypeTwitter"])
        keyboardType = UIKeyboardTypeTwitter;
    else if ([stringType isEqualToString:@"UIKeyboardTypeWebSearch"])
        keyboardType = UIKeyboardTypeWebSearch;
    [self.textField setKeyboardType:keyboardType];
}

- (void)setKeyboardAppearance:(UIKeyboardAppearance)keyboardAppearance
{
    [self.textField setKeyboardAppearance:keyboardAppearance];
}

- (void)xibSetup
{
    UIView *view = [self loadViewFromNib];
    view.frame = self.bounds;
    view.autoresizingMask = UIViewAutoresizingFlexibleWidth|UIViewAutoresizingFlexibleHeight;
    [self addSubview:view];
}

- (UIView*)loadViewFromNib
{
    NSBundle *bundle = [NSBundle bundleForClass:[self class]];
    UINib *nib = [UINib nibWithNibName:@"ErrorTextField" bundle:bundle];
    return [[nib instantiateWithOwner:self options:nil] objectAtIndex:0];
}

@end
