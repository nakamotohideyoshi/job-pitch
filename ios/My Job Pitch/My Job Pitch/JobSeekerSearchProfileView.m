//
//  JobSeekerSearchProfileView.m
//  My Job Pitch
//
//  Created by user on 27/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "JobSeekerSearchProfileView.h"
#import "Contract.h"
#import "Hours.h"

@interface JobSeekerSearchProfileView ()
@property (nonatomic, nonnull) NSArray *contracts;
@property (nonatomic, nonnull) NSArray *hoursList;
@end

@implementation JobSeekerSearchProfileView

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
    self.contractPicker = [[DownPicker alloc] initWithTextField:self.contract.textField];
    self.hoursPicker = [[DownPicker alloc] initWithTextField:self.hours.textField];
}

- (UIView*)loadViewFromNib
{
    NSBundle *bundle = [NSBundle bundleForClass:[self class]];
    UINib *nib = [UINib nibWithNibName:@"JobSeekerSearchProfileView" bundle:bundle];
    return [[nib instantiateWithOwner:self options:nil] objectAtIndex:0];
}

- (void)setContracts:(NSArray*)contractObjects
{
    _contracts = contractObjects;
    NSMutableArray *contracts = [[NSMutableArray alloc] initWithCapacity:contractObjects.count];
    [contracts addObject:@"Any"];
    for (Contract *contract in contractObjects)
        [contracts addObject: contract.name];
    [self.contractPicker setData:contracts];
    [self.contractPicker setPlaceholder:@"Contract"];
}

- (void)setHoursOptions:(NSArray*)hoursObjects
{
    _hoursList = hoursObjects;
    NSMutableArray *hoursOptions = [[NSMutableArray alloc] initWithCapacity:hoursObjects.count];
    [hoursOptions addObject:@"Any"];
    for (Hours *hours in hoursObjects)
        [hoursOptions addObject: hours.name];
    [self.hoursPicker setData:hoursOptions];
    [self.hoursPicker setPlaceholder:@"Hours"];
}

- (IBAction)continue:(nullable id)sender {
    [self.delegate continue];
}

-(void)save:(Profile*)profile
{
    NSNumber *newContract = nil;
    for (Contract *contract in self.contracts) {
        if ([contract.name isEqualToString:self.contract.textField.text]) {
            newContract = contract.id;
            break;
        }
    }
    profile.contract = newContract;
    
    NSNumber *newHours = nil;
    for (Hours *hours in self.hoursList) {
        if ([hours.name isEqualToString:self.hours.textField.text]) {
            newHours = hours.id;
            break;
        }
    }
    profile.hours = newHours;
}

-(void)load:(Profile*)profile
{
    NSString *newContract = nil;
    if (profile.contract) {
        for (Contract *contract in self.contracts) {
            if ([contract.id isEqual:profile.contract]) {
                newContract = contract.name;
                break;
            }
        }
    }
    if (newContract == nil)
        newContract = @"Any";
    self.contract.textField.text = newContract;
    
    NSString *newHours = nil;
    if (profile.hours) {
        for (Hours *hours in self.hoursList) {
            if ([hours.id isEqual:profile.hours]) {
                newHours = hours.name;
                break;
            }
        }
    }
    if (newHours == nil)
        newHours = @"Any";
    self.hours.textField.text = newHours;
}

@end
