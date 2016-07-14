//
//  JobSeekerProfileView.m
//  My Job Pitch
//
//  Created by user on 07/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "JobSeekerProfileView.h"
#import "Sex.h"
#import "Nationality.h"

@interface JobSeekerProfileView ()

@property (nonatomic, nonnull) NSArray *sexes;
@property (nonatomic, nonnull) NSArray *nationalities;

@end

@implementation JobSeekerProfileView

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
    self.sexPicker = [[DownPicker alloc] initWithTextField:self.sex.textField];
    self.nationalityPicker = [[DownPicker alloc] initWithTextField:self.nationality.textField];
}

- (UIView*)loadViewFromNib
{
    NSBundle *bundle = [NSBundle bundleForClass:[self class]];
    UINib *nib = [UINib nibWithNibName:@"JobSeekerProfileView" bundle:bundle];
    return [[nib instantiateWithOwner:self options:nil] objectAtIndex:0];
}

- (void)setSexes:(NSArray*)sexObjects
{
    _sexes = sexObjects;
    NSMutableArray *sexes = [[NSMutableArray alloc] initWithCapacity:sexObjects.count];
    [sexes addObject:@"Not specified"];
    for (Sex *sex in sexObjects)
        [sexes addObject: sex.name];
    [self.sexPicker setData:sexes];
    [self.sexPicker setPlaceholder:@"Sex (optional)"];
}

- (void)setNationalities:(NSArray*)nationalityObjects
{
    _nationalities = nationalityObjects;
    NSMutableArray *nationalities = [[NSMutableArray alloc] initWithCapacity:nationalityObjects.count];
    [nationalities addObject:@"Not specified"];
    for (Nationality *nationality in nationalityObjects)
        [nationalities addObject: nationality.name];
    [self.nationalityPicker setData:nationalities];
    [self.nationalityPicker setPlaceholder:@"Nationality (optional)"];
}

- (BOOL)textView:(UITextView *)textView shouldChangeTextInRange:(NSRange)range replacementText:(NSString *)text
{
    int remaining = 500 - ((int)[[textView text] length] - (int)range.length + (int)text.length);
    if (remaining >= 0) {
        self.descriptionCharactersRemaining.text = [NSString
                                                    stringWithFormat:@"%d characters remaining", remaining];
        return TRUE;
    }
    return FALSE;
}

- (IBAction)continue:(nullable id)sender {
    [self.delegate continue];
}

-(void)save:(JobSeeker*)jobSeeker
{
    jobSeeker.active = self.active.isOn;
    jobSeeker.firstName = self.firstName.textField.text;
    jobSeeker.lastName = self.lastName.textField.text;
    jobSeeker.email = self.email.textField.text;
    jobSeeker.telephone = self.telephone.textField.text;
    jobSeeker.mobile = self.mobile.textField.text;
    jobSeeker.age = @([self.age.textField.text integerValue]);
    
    NSNumber *newSex = nil;
    for (Sex *sex in self.sexes) {
        if ([sex.name isEqualToString:self.sex.textField.text]) {
            newSex = sex.id;
            break;
        }
    }
    jobSeeker.sex = newSex;
    
    NSNumber *newNationality = nil;
    for (Nationality *nationality in self.nationalities) {
        if ([nationality.name isEqualToString:self.nationality.textField.text]) {
            newNationality = nationality.id;
            break;
        }
    }
    jobSeeker.nationality = newNationality;
    
    jobSeeker.emailPublic = self.emailPublic.isOn;
    jobSeeker.telephonePublic = self.telephonePublic.isOn;
    jobSeeker.mobilePublic = self.mobilePublic.isOn;
    jobSeeker.agePublic = self.agePublic.isOn;
    jobSeeker.sexPublic = self.sexPublic.isOn;
    jobSeeker.nationalityPublic = self.nationalityPublic.isOn;
    jobSeeker.desc = self.descriptionView.text;
    jobSeeker.hasReferences = self.hasReferences.isOn;
}

-(void)load:(JobSeeker*)jobSeeker
{
    self.active.on = jobSeeker.active;
    self.firstName.textField.text = jobSeeker.firstName;
    self.lastName.textField.text = jobSeeker.lastName;
    self.email.textField.text = jobSeeker.email;
    self.telephone.textField.text = jobSeeker.telephone;
    self.mobile.textField.text = jobSeeker.mobile;
    self.age.textField.text = [jobSeeker.age stringValue];
    if (jobSeeker.sex) {
        for (Sex *sex in self.sexes) {
            if ([sex.id isEqual:jobSeeker.sex]) {
                self.sex.textField.text = sex.name;
                break;
            }
        }
    }
    if (jobSeeker.nationality) {
        for (Nationality *nationality in self.nationalities) {
            if ([nationality.id isEqual:jobSeeker.nationality]) {
                self.nationality.textField.text = nationality.name;
                break;
            }
        }
    }
    self.emailPublic.on = jobSeeker.emailPublic;
    self.telephonePublic.on = jobSeeker.telephonePublic;
    self.mobilePublic.on = jobSeeker.mobilePublic;
    self.agePublic.on = jobSeeker.agePublic;
    self.sexPublic.on = jobSeeker.sexPublic;
    self.nationalityPublic.on = jobSeeker.nationalityPublic;
    self.descriptionView.text = jobSeeker.desc;
    self.hasReferences.on = jobSeeker.hasReferences;
}

- (IBAction)fileSelect:(id)sender {
    
}

- (IBAction)changedTickBox:(id)sender {
    _continueButton.enabled = _tickBox.isOn;
}


@end
