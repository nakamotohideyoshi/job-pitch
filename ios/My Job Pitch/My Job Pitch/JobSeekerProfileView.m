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
#import "DropboxBrowserViewController.h"

@interface JobSeekerProfileView () <DropboxBrowserDelegate>

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
    
    self.email.textField.text = [AppHelper getEmail];
    self.email.textField.textColor = [UIColor colorWithRed:0.5 green:0.5 blue:0.5 alpha:1];
    self.email.textField.enabled = false;
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
    jobSeeker.truthConfirmation = self.tickBox.isOn;
}

-(void)load:(JobSeeker*)jobSeeker
{
    self.active.on = jobSeeker.active;
    self.firstName.textField.text = jobSeeker.firstName;
    self.lastName.textField.text = jobSeeker.lastName;
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
    self.tickBox.on = jobSeeker.truthConfirmation;
    
    _continueButton.enabled = _tickBox.isOn;
}

- (IBAction)fileSelect:(id)sender {
    
//    MyAlertController *alertController = [MyAlertController alertControllerWithTitle:@"File Select" message:nil preferredStyle:UIAlertControllerStyleActionSheet];
//    
//    UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleCancel handler:nil];
//    [alertController addAction:cancelAction];
//    
//    UIAlertAction *googleAction = [UIAlertAction actionWithTitle:@"from Google Drive" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
//        
//    }];
//    [alertController addAction:googleAction];
//    
//    UIAlertAction *dropboxAction = [UIAlertAction actionWithTitle:@"from DropBox" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
    
        UIViewController *viewController = [AppHelper getCurrentVC];
        DropboxBrowserViewController *browser = [viewController.storyboard instantiateViewControllerWithIdentifier:@"DropboxBrowser"];
        browser.rootViewDelegate = self;
        UINavigationController *modalDialog = [[UINavigationController alloc]initWithRootViewController:browser];
        [viewController presentViewController:modalDialog animated:YES completion:nil];
        
//    }];
//    [alertController addAction:dropboxAction];
//    
//    [[AppHelper getCurrentVC] presentViewController:alertController animated:YES completion:nil];
    
}

- (void)dropboxBrowser:(DropboxBrowserViewController *)browser didDownloadFile:(NSString *)fileName didOverwriteFile:(BOOL)isLocalFileOverwritten {
    self.cvFileName.text = fileName;
    [browser removeDropboxBrowser];
}

- (IBAction)changedTickBox:(id)sender {
    _continueButton.enabled = _tickBox.isOn;
}


@end
