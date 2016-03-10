//
//  LocationEditView.m
//  My Job Pitch
//
//  Created by user on 09/02/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "LocationEditView.h"
@import AssetsLibrary;

@interface LocationEditView ()
@property (nullable) Image *image;
@property (nonatomic, nonnull) NSString *placeID;
@property (nonatomic, nonnull) NSString *placeName;
@property (nonatomic, nonnull) NSNumber *placeLatitude;
@property (nonatomic, nonnull) NSNumber *placeLongitude;
@end

@implementation LocationEditView {
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
    self.noImage.hidden = false;
    self.imageActivity.hidden = true;
    self.location.textField.enabled = false;
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
    
    self.placeID = location.placeID;
    self.placeName = location.placeName;
    self.placeLatitude = location.latitude;
    self.placeLongitude = location.longitude;
    [self updateLocation];
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
    location.placeID = self.placeID;
    location.placeName = self.placeName;
    location.latitude = self.placeLatitude;
    location.longitude = self.placeLongitude;
}

- (IBAction)changeImage:(id)sender {
    ipc= [[UIImagePickerController alloc] init];
    ipc.delegate = self;
    ipc.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
    
    if(UI_USER_INTERFACE_IDIOM()==UIUserInterfaceIdiomPhone) {
        [self.window.rootViewController
         presentViewController:ipc animated:true completion:nil];
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
    ALAssetsLibrary *library = [[ALAssetsLibrary alloc] init];
    [library assetForURL:referenceURL
             resultBlock:^(ALAsset *asset) {
                 self.imageForUpload = [UIImage imageWithCGImage:[[asset defaultRepresentation] fullResolutionImage]];
                 self.imageView.image = self.imageForUpload;
                 self.changeCenterContraint.priority = UILayoutPriorityDefaultLow;
                 self.deleteButton.hidden = false;
                 self.noImage.hidden = true;
             }
            failureBlock:^(NSError *error) {}];
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
    self.image = nil;
    self.imageForUpload = nil;
    self.imageView.image = nil;
    self.changeCenterContraint.priority = UILayoutPriorityDefaultHigh;
    self.deleteButton.hidden = true;
    self.noImage.hidden = false;
}

- (IBAction)changeLocation:(id)sender {
    LocationMapView *map = [[LocationMapView alloc] initWithNibName:@"LocationMap" bundle:nil];
    [map setDelegate:self];
    if (self.placeLatitude != nil)
        [map setLocationWithLatitude:self.placeLatitude
                           longitude:self.placeLongitude
                                name:self.placeName
                             placeID:self.placeID];
    UINavigationController *navigationController = (UINavigationController *)self.window.rootViewController;
    [navigationController pushViewController:map animated:YES];

}

- (void)updateLocation
{
    if (self.placeName) {
        if (self.placeID == nil || [self.placeID isEqualToString:@""])
            self.location.textField.text = self.placeName;
        else
            self.location.textField.text = [NSString stringWithFormat:@"%@ (from Google)", self.placeName];
        self.location.error = nil;
    } else {
        self.location.textField.text = @"";
    }
}

- (void)setLocationWithLatitude:(NSNumber *)latitude
                      longitude:(NSNumber *)longitude
                           name:(NSString *)name
                        placeID:(NSString *)placeID
{
    self.placeLatitude = latitude;
    self.placeLongitude = longitude;
    self.placeName = name;
    self.placeID = placeID;
    [self updateLocation];
}

@end
