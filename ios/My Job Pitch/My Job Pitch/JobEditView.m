//
//  JobEditView.m
//  My Job Pitch
//
//  Created by user on 13/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "JobEditView.h"
#import "Contract.h"
#import "Hours.h"
#import "Sector.h"
#import "JobStatus.h"
@import AssetsLibrary;

@interface JobEditView ()
@property (nullable) Image *image;
@property (nonatomic, nonnull) NSArray *contractList;
@property (nonatomic, nonnull) NSArray *hoursList;
@property (nonatomic, nonnull) NSArray *sectorList;
@property (nonatomic, nonnull) NSArray *statusList;
@end

@implementation JobEditView {
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
    
    self.contractPicker = [[DownPicker alloc] initWithTextField:self.contract.textField];
    self.hoursPicker = [[DownPicker alloc] initWithTextField:self.hours.textField];
    self.sectorsPicker = [[DownPicker alloc] initWithTextField:self.sector.textField];
    
    self.changeCenterContraint.priority = UILayoutPriorityDefaultHigh;
    self.deleteButton.hidden = true;
    self.noImage.hidden = false;
    self.imageActivity.hidden = true;
}

- (UIView*)loadViewFromNib
{
    NSBundle *bundle = [NSBundle bundleForClass:[self class]];
    UINib *nib = [UINib nibWithNibName:@"JobEditView" bundle:bundle];
    return [[nib instantiateWithOwner:self options:nil] objectAtIndex:0];
}


- (void)setContractOptions:(NSArray*)contractObjects
{
    _contractList = contractObjects;
    NSMutableArray *contractOptions = [[NSMutableArray alloc] initWithCapacity:contractObjects.count];
    for (Contract *contract in contractObjects)
        [contractOptions addObject: contract.name];
    [self.contractPicker setData:contractOptions];
    [self.contractPicker setPlaceholder:@"Contract"];
}

- (void)setHoursOptions:(NSArray*)hoursObjects
{
    _hoursList = hoursObjects;
    NSMutableArray *hoursOptions = [[NSMutableArray alloc] initWithCapacity:hoursObjects.count];
    for (Hours *hours in hoursObjects)
        [hoursOptions addObject: hours.name];
    [self.hoursPicker setData:hoursOptions];
    [self.hoursPicker setPlaceholder:@"Hours"];
}

- (void)setSectorOptions:(NSArray*)sectorObjects
{
    _sectorList = sectorObjects;
    NSMutableArray *sectorOptions = [[NSMutableArray alloc] initWithCapacity:sectorObjects.count];
    for (Sector *sector in sectorObjects)
        [sectorOptions addObject: sector.name];
    [self.sectorsPicker setData:sectorOptions];
    [self.sectorsPicker setPlaceholder:@"Sectors"];
}

- (void)setStatusOptions:(NSArray*)statusOptions
{
    _statusList = statusOptions;
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

- (void)load:(nonnull Job*)job
{
    if (job.status) {
        for (JobStatus *status in self.statusList) {
            if ([status.id isEqual:job.status]) {
                self.active.on = [status.name isEqualToString:JOB_STATUS_OPEN];
                break;
            }
        }
    } else {
        self.active.on = true;
    }
    
    self.title.textField.text = job.title;
    self.descriptionView.text = job.desc;
    
    NSString *newSector = nil;
    if (job.sector) {
        for (Sector *sector in self.sectorList) {
            if ([sector.id isEqual:job.sector]) {
                newSector = sector.name;
                break;
            }
        }
    }
    self.sector.textField.text = newSector;
    
    NSString *newContract = nil;
    if (job.contract) {
        for (Contract *contract in self.contractList) {
            if ([contract.id isEqual:job.contract]) {
                newContract = contract.name;
                break;
            }
        }
    }
    self.contract.textField.text = newContract;
    
    NSString *newHours = nil;
    if (job.hours) {
        for (Hours *hours in self.hoursList) {
            if ([hours.id isEqual:job.hours]) {
                newHours = hours.name;
                break;
            }
        }
    }
    self.hours.textField.text = newHours;
    
    self.image = [job getImage];
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

- (void)save:(nonnull Job*)job
{
    NSString *statusName;
    if (self.active.on)
        statusName = JOB_STATUS_OPEN;
    else
        statusName = JOB_STATUS_CLOSED;
    for (JobStatus *status in self.statusList) {
        if ([status.name isEqualToString:statusName]) {
            job.status = status.id;
            break;
        }
    }
    
    job.title = self.title.textField.text;
    job.desc = self.descriptionView.text;
    
    NSNumber *newSector = nil;
    for (Sector *sector in self.sectorList) {
        if ([sector.name isEqualToString:self.sector.textField.text]) {
            newSector = sector.id;
            break;
        }
    }
    job.sector = newSector;
    
    NSNumber *newContract = nil;
    for (Contract *contract in self.contractList) {
        if ([contract.name isEqualToString:self.contract.textField.text]) {
            newContract = contract.id;
            break;
        }
    }
    job.contract = newContract;
    
    NSNumber *newHours = nil;
    for (Hours *hours in self.hoursList) {
        if ([hours.name isEqualToString:self.hours.textField.text]) {
            newHours = hours.id;
            break;
        }
    }
    job.hours = newHours;
}

@end
