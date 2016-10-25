//
//  CompanyEditView.m
//  My Job Pitch
//
//  Created by user on 03/02/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "BusinessEditView.h"
@import AssetsLibrary;

@interface BusinessEditView ()
@property (nullable) Image *image;
@end

@implementation BusinessEditView {
    UIImagePickerController *ipc;
    UIPopoverController *popover;
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
    
    self.changeCenterContraint.priority = UILayoutPriorityDefaultHigh;
    self.deleteButton.hidden = true;
    self.imageActivity.hidden = true;
    self.imageView.image = [UIImage imageNamed:@"no-img"];
}

- (UIView*)loadViewFromNib
{
    NSBundle *bundle = [NSBundle bundleForClass:[self class]];
    UINib *nib = [UINib nibWithNibName:@"BusinessEditView" bundle:bundle];
    return [[nib instantiateWithOwner:self options:nil] objectAtIndex:0];
}

- (void)load:(Business*)business {
    if (business == nil) return;
    
    self.name.textField.text = business.name;
    self.image = [business getImage];
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
        self.imageActivity.hidden = true;
        self.imageView.image = [UIImage imageNamed:@"no-img"];
    }
}

- (void)save:(nonnull Business*)business
{
    business.name = self.name.textField.text;
}

- (IBAction)changeImage:(id)sender {
    
    MyAlertController * sheet=   [MyAlertController
                                  alertControllerWithTitle:nil
                                  message:nil
                                  preferredStyle:UIAlertControllerStyleActionSheet];
    
    UIAlertAction* camera = [UIAlertAction
                             actionWithTitle:@"Camera"
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
    
    UIAlertAction* cancel = [UIAlertAction
                             actionWithTitle:@"Cancel"
                             style:UIAlertActionStyleCancel
                             handler:^(UIAlertAction * action) {
                                 [sheet dismissViewControllerAnimated:YES completion:nil];
                             }];
    [sheet addAction:cancel];
    
    [self.window.rootViewController presentViewController:sheet animated:YES completion:nil];
}

-(void) showImagePickerController:(UIImagePickerControllerSourceType)type {
    ipc= [[UIImagePickerController alloc] init];
    ipc.delegate = self;
    ipc.sourceType = type;
    if(UI_USER_INTERFACE_IDIOM()==UIUserInterfaceIdiomPhone) {
        [self.window.rootViewController presentViewController:ipc animated:true completion:nil];
    } else {
        popover=[[UIPopoverController alloc]initWithContentViewController:ipc];
        [popover presentPopoverFromRect:self.changeButton.frame
                                 inView:self
               permittedArrowDirections:UIPopoverArrowDirectionAny
                               animated:YES];
    }
}

-(void)imagePickerController:(UIImagePickerController *)picker didFinishPickingMediaWithInfo:(NSDictionary *)info
{
    [self dismissPicker];
    
    NSURL *referenceURL = [info objectForKey:UIImagePickerControllerReferenceURL];
    if (referenceURL) {
        ALAssetsLibrary *library = [[ALAssetsLibrary alloc] init];
        [library assetForURL:referenceURL
                 resultBlock:^(ALAsset *asset) {
                     self.imageForUpload = [UIImage imageWithCGImage:[[asset defaultRepresentation] fullResolutionImage]];
                     self.imageView.image = self.imageForUpload;
                     self.changeCenterContraint.priority = UILayoutPriorityDefaultLow;
                     self.deleteButton.hidden = false;
                 }
                failureBlock:^(NSError *error) {}];
    } else {
        UIImage *editedImage = (UIImage *) [info objectForKey: UIImagePickerControllerEditedImage];
        UIImage *originalImage = (UIImage *) [info objectForKey: UIImagePickerControllerOriginalImage];
        self.imageForUpload = editedImage ? editedImage : originalImage;
        self.imageView.image = self.imageForUpload;
        self.changeCenterContraint.priority = UILayoutPriorityDefaultLow;
        self.deleteButton.hidden = false;
    }
    
}

-(void)imagePickerControllerDidCancel:(UIImagePickerController *)picker
{
    [self dismissPicker];
}

- (void)dismissPicker
{
    if (UI_USER_INTERFACE_IDIOM()==UIUserInterfaceIdiomPhone) {
        [ipc dismissViewControllerAnimated:true completion:nil];
    } else {
        [popover dismissPopoverAnimated:YES];
    }
}

- (IBAction)deleteImage:(id)sender {
    [MyAlertController title:nil message:@"Are you sure you want to remove this image?" ok:@"Delete" okCallback:^{
        self.image = nil;
        self.imageForUpload = nil;
        self.imageView.image = [UIImage imageNamed:@"no-img"];
        self.deleteButton.hidden = true;
        self.changeCenterContraint.priority = UILayoutPriorityDefaultHigh;
    } cancel:@"Cancel" cancelCallback:nil];
}

@end
