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

@import AssetsLibrary;

@interface JobSeekerProfileView () <DropboxBrowserDelegate, UITextViewDelegate, UIImagePickerControllerDelegate, UITextFieldDelegate>

@property (nonatomic, nonnull) NSArray *sexes;
@property (nonatomic, nonnull) NSArray *nationalities;


@end

@implementation JobSeekerProfileView {
    UILabel *descriPlaceholder;
    UIImagePickerController *ipc;
    UIPopoverController *popover;
    NSString *cv;
}

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
    
    descriPlaceholder = [[UILabel alloc] initWithFrame:CGRectMake(10.0f, 0, self.descriptionView.frame.size.width - 10.0f, 34.0f)];
    [descriPlaceholder setText:@"Description"];
    [descriPlaceholder setBackgroundColor:[UIColor clearColor]];
    [descriPlaceholder setTextColor:[UIColor colorWithRed:200/255.0f green:200/255.0f blue:200/255.0f alpha:200/255.0f]];
    self.descriptionView.delegate = self;
    [self.descriptionView addSubview:descriPlaceholder];
    
    self.firstName.textField.delegate = self;
    self.lastName.textField.delegate = self;
}

- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string
{
    NSRange lowercaseCharRange = [string rangeOfCharacterFromSet:[NSCharacterSet lowercaseLetterCharacterSet]];
    if (lowercaseCharRange.location != NSNotFound) {
        UITextRange *selectedRange = [textField selectedTextRange];
        
        textField.text = [textField.text stringByReplacingCharactersInRange:range
                                                                 withString:[string uppercaseString]];
        
        UITextPosition *newPosition = [textField positionFromPosition:selectedRange.start offset:1];
        UITextRange *newRange = [textField textRangeFromPosition:newPosition toPosition:newPosition];
        [textField setSelectedTextRange:newRange];
        
        return NO;
    }
    
    return YES;
}

- (UIView*)loadViewFromNib
{
    NSBundle *bundle = [NSBundle bundleForClass:[self class]];
    UINib *nib = [UINib nibWithNibName:@"JobSeekerProfileView" bundle:bundle];
    return [[nib instantiateWithOwner:self options:nil] objectAtIndex:0];
}

- (void)textViewDidEndEditing:(UITextView *)textView {
    if (![self.descriptionView hasText]) {
        descriPlaceholder.hidden = NO;
    }
}

- (void)textViewDidChange:(UITextView *)textView {
    if (![self.descriptionView hasText]) {
        descriPlaceholder.hidden = NO;
    } else {
        descriPlaceholder.hidden = YES;
    }
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
    jobSeeker.firstName = [self.firstName.textField.text uppercaseString];
    jobSeeker.lastName = [self.lastName.textField.text uppercaseString];
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
    jobSeeker.cv = cv;
}

-(void)load:(JobSeeker*)jobSeeker
{
    self.active.on = jobSeeker.active;
    self.firstName.textField.text = [jobSeeker.firstName uppercaseString];
    self.lastName.textField.text = [jobSeeker.lastName uppercaseString];
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
    
    [self textViewDidChange:self.descriptionView];
    
    _continueButton.enabled = _tickBox.isOn;
}

- (IBAction)changedTickBox:(id)sender {
    _continueButton.enabled = _tickBox.isOn;
}

- (IBAction)fileSelect:(id)sender {
    
    MyAlertController * sheet=   [MyAlertController
                                  alertControllerWithTitle:nil
                                  message:nil
                                  preferredStyle:UIAlertControllerStyleActionSheet];
    
    UIAlertAction* camera = [UIAlertAction
                             actionWithTitle:@"Take Photo"
                             style:UIAlertActionStyleDefault
                             handler:^(UIAlertAction * action) {
                                 [sheet dismissViewControllerAnimated:YES completion:nil];
                                 [self showImagePickerController:UIImagePickerControllerSourceTypeCamera];
                             }];
    [sheet addAction:camera];
    
    UIAlertAction* photoLibrary = [UIAlertAction
                                   actionWithTitle:@"Photo Library"
                                   style:UIAlertActionStyleDefault
                                   handler:^(UIAlertAction * action) {
                                       [sheet dismissViewControllerAnimated:YES completion:nil];
                                       [self showImagePickerController:UIImagePickerControllerSourceTypePhotoLibrary];
                                   }];
    [sheet addAction:photoLibrary];
    
    UIAlertAction* dropBox = [UIAlertAction
                                   actionWithTitle:@"Dropbox"
                                   style:UIAlertActionStyleDefault
                                   handler:^(UIAlertAction * action) {
                                       UIViewController *viewController = [AppHelper getCurrentVC];
                                       DropboxBrowserViewController *browser = [viewController.storyboard instantiateViewControllerWithIdentifier:@"DropboxBrowser"];
                                       browser.rootViewDelegate = self;
                                       UINavigationController *modalDialog = [[UINavigationController alloc]initWithRootViewController:browser];
                                       [viewController presentViewController:modalDialog animated:YES completion:nil];
                                   }];
    [sheet addAction:dropBox];
    
    UIAlertAction* cancel = [UIAlertAction
                             actionWithTitle:@"Cancel"
                             style:UIAlertActionStyleCancel
                             handler:^(UIAlertAction * action) {
                                 [sheet dismissViewControllerAnimated:YES completion:nil];
                             }];
    [sheet addAction:cancel];
    
    [self.window.rootViewController presentViewController:sheet animated:YES completion:nil];
    
}

- (void)dropboxBrowser:(DropboxBrowserViewController *)browser didDownloadFile:(NSString *)fileName didOverwriteFile:(BOOL)isLocalFileOverwritten {
    cv = fileName;
    self.cvFileName.text = fileName;
    NSString *s = browser.downloadedFilePath;
    _cvdata = [NSData dataWithContentsOfFile:s];
    
    [browser removeDropboxBrowser];
}

-(void) showImagePickerController:(UIImagePickerControllerSourceType)type {
    if ([UIImagePickerController isSourceTypeAvailable:type]) {
        if (ipc == nil) {
            ipc = [[UIImagePickerController alloc] init];
            ipc.mediaTypes = @[(NSString*)kUTTypeImage];
            ipc.delegate = self;
        }
        ipc.sourceType = type;
        [self.window.rootViewController presentViewController:ipc animated:true completion:nil];
    } else {
        [MyAlertController title:nil message:@"You don't have camera." ok:@"OK" okCallback:nil cancel:nil cancelCallback:nil];
    }
}

-(void)imagePickerController:(UIImagePickerController *)picker didFinishPickingMediaWithInfo:(NSDictionary *)info {
    [self dismissPicker];
    
    NSURL *referenceURL = [info objectForKey:UIImagePickerControllerReferenceURL];
    if (referenceURL) {
        ALAssetsLibrary *library = [[ALAssetsLibrary alloc] init];
        [library assetForURL:referenceURL
                 resultBlock:^(ALAsset *asset) {
                     UIImage *image = [UIImage imageWithCGImage:[[asset defaultRepresentation] fullResolutionImage]];
                     _cvdata = UIImagePNGRepresentation(image);
                 }
                failureBlock:^(NSError *error) {}];
    } else {
        UIImage *editedImage = (UIImage *) [info objectForKey: UIImagePickerControllerEditedImage];
        UIImage *originalImage = (UIImage *) [info objectForKey: UIImagePickerControllerOriginalImage];
        UIImage *image = editedImage ? editedImage : originalImage;
        _cvdata = UIImagePNGRepresentation(image);
    }

    cv = @"cv.jpg";
    self.cvFileName.text = @"cv.jpg";
}

-(void)imagePickerControllerDidCancel:(UIImagePickerController *)picker {
    [self dismissPicker];
}

- (void)dismissPicker {
    if (UI_USER_INTERFACE_IDIOM()==UIUserInterfaceIdiomPhone) {
        [ipc dismissViewControllerAnimated:true completion:nil];
    } else {
        [popover dismissPopoverAnimated:YES];
    }
}


@end
