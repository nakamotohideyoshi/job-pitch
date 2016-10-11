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

@interface JobEditView () <UITextViewDelegate>
@property (nullable) Image *image;
@property (nonatomic, nonnull) NSArray *contractList;
@property (nonatomic, nonnull) NSArray *hoursList;
@property (nonatomic, nonnull) NSArray *sectorList;
@property (nonatomic, nonnull) NSArray *statusList;
@end

@implementation JobEditView {
    UIImagePickerController *ipc;
    UIPopoverController *popover;
    UILabel *descriPlaceholder;
    Job *mJob;
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
    self.noImage.text = @"";
    self.imageActivity.hidden = true;
    self.imageView.image = [UIImage imageNamed:@"no-img"];
    
    descriPlaceholder = [[UILabel alloc] initWithFrame:CGRectMake(10.0f, 0, self.descriptionView.frame.size.width - 10.0f, 34.0f)];
    [descriPlaceholder setText:@"Description"];
    [descriPlaceholder setBackgroundColor:[UIColor clearColor]];
    [descriPlaceholder setTextColor:[UIColor colorWithRed:200/255.0f green:200/255.0f blue:200/255.0f alpha:200/255.0f]];
    self.descriptionView.delegate = self;
    [self.descriptionView addSubview:descriPlaceholder];
}

- (UIView*)loadViewFromNib
{
    NSBundle *bundle = [NSBundle bundleForClass:[self class]];
    UINib *nib = [UINib nibWithNibName:@"JobEditView" bundle:bundle];
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
    
//    UIAlertAction* fromWebsite = [UIAlertAction
//                                  actionWithTitle:@"From Website"
//                                  style:UIAlertActionStyleDefault
//                                  handler:^(UIAlertAction * action) {
//                                      [self showUrlInputBox];
//                                  }];
//    [sheet addAction:fromWebsite];
    
    UIAlertAction* cancel = [UIAlertAction
                             actionWithTitle:@"Cancel"
                             style:UIAlertActionStyleCancel
                             handler:^(UIAlertAction * action) {
                                 [sheet dismissViewControllerAnimated:YES completion:nil];
                             }];
    [sheet addAction:cancel];
    
    [self.window.rootViewController presentViewController:sheet animated:YES completion:nil];
}

//-(void)showUrlInputBox {
//    MyAlertController * alert=   [MyAlertController
//                                  alertControllerWithTitle:nil
//                                  message:@"Enter Image Url"
//                                  preferredStyle:UIAlertControllerStyleAlert];
//    
//    UIAlertAction* ok = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault
//                                               handler:^(UIAlertAction * action) {
//                                                   NSString *url = [alert.textFields.firstObject.text stringByTrimmingCharactersInSet:
//                                                                    [NSCharacterSet whitespaceCharacterSet]];
//                                                   if ([url isEqualToString:@""]) {
//                                                       [alert dismissViewControllerAnimated:YES completion:nil];
//                                                       return;
//                                                   };
//                                                   
//                                                   [SVProgressHUD show];
//                                                   NSURL *imageURL = [NSURL URLWithString:url];
//                                                   [NSURLConnection sendAsynchronousRequest:[NSURLRequest requestWithURL:imageURL]
//                                                                                      queue:[NSOperationQueue mainQueue]
//                                                                          completionHandler:^(NSURLResponse *response, NSData *data, NSError *error) {
//                                                                              if (error == nil) {
//                                                                                  UIImage *image = [UIImage imageWithData:data];
//                                                                                  if (image != nil) {
//                                                                                      self.imageForUpload = image;
//                                                                                      self.imageView.image = image;
//                                                                                      self.imageView.alpha = 1.0f;
//                                                                                      self.changeCenterContraint.priority = UILayoutPriorityDefaultLow;
//                                                                                      self.deleteButton.hidden = false;
//                                                                                      self.noImage.hidden = true;
//                                                                                  }
//                                                                              }
//                                                                              [alert dismissViewControllerAnimated:YES completion:nil];
//                                                                              [SVProgressHUD dismiss];
//                                                                          }];
//                                               }];
//    UIAlertAction* cancel = [UIAlertAction actionWithTitle:@"Cancel" style:UIAlertActionStyleDefault
//                                                   handler:^(UIAlertAction * action) {
//                                                       [alert dismissViewControllerAnimated:YES completion:nil];
//                                                   }];
//    
//    [alert addAction:ok];
//    [alert addAction:cancel];
//    
//    [alert addTextFieldWithConfigurationHandler:^(UITextField *textField) {
//        textField.placeholder = @"Image Url";
//    }];
//    
//    [self.window.rootViewController presentViewController:alert animated:YES completion:nil];
//}

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
                     self.imageView.alpha = 1.0f;
                     self.changeCenterContraint.priority = UILayoutPriorityDefaultLow;
                     self.deleteButton.hidden = false;
                     self.noImage.text = @"";
                 }
                failureBlock:^(NSError *error) {}];
    } else {
        UIImage *editedImage = (UIImage *) [info objectForKey: UIImagePickerControllerEditedImage];
        UIImage *originalImage = (UIImage *) [info objectForKey: UIImagePickerControllerOriginalImage];
        self.imageForUpload = editedImage ? editedImage : originalImage;
        self.imageView.image = self.imageForUpload;
        self.changeCenterContraint.priority = UILayoutPriorityDefaultLow;
        self.deleteButton.hidden = false;
        self.noImage.text = @"";
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
        self.imageView.image = nil;
        self.changeCenterContraint.priority = UILayoutPriorityDefaultHigh;
        self.deleteButton.hidden = true;
        
        self.image = [mJob.locationData getImage];
        if (self.image && self.image.image) {
            [self.imageActivity setHidden:false];
            [self.imageActivity startAnimating];
            self.imageView.image = nil;
            NSURL *imageURL = [NSURL URLWithString:self.image.image];
            [NSURLConnection sendAsynchronousRequest:[NSURLRequest requestWithURL:imageURL]
                                               queue:[NSOperationQueue mainQueue]
                                   completionHandler:^(NSURLResponse *response, NSData *data, NSError *error) {
                                       self.imageView.image = [UIImage imageWithData:data];
                                       [self.imageActivity setHidden:true];
                                       [self.imageActivity stopAnimating];
                                       
                                       Location *location = mJob.locationData;
                                       self.noImage.text = (location.images && location.images.count > 0) ? @"image set by place" : @"image set by company";
                                       self.imageView.alpha = 0.5f;
                                   }];
        } else {
            self.imageActivity.hidden = true;
            self.imageView.image = [UIImage imageNamed:@"no-img"];
        }

        
    } cancel:@"Cancel" cancelCallback:nil];
}

- (void)load:(nonnull Job*)job
{
    mJob = job;
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
    [self textViewDidChange:self.descriptionView];
    
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
    
    if (job.images && job.images.count > 0) {
        self.changeCenterContraint.priority = UILayoutPriorityDefaultLow;
        self.deleteButton.hidden = false;
        self.noImage.text = @"";
        self.imageView.alpha = 1.0f;
        
    } else {
        self.changeCenterContraint.priority = UILayoutPriorityDefaultHigh;
        self.deleteButton.hidden = true;
        Location *location = mJob.locationData;
        self.noImage.text = (location.images && location.images.count > 0) ? @"image set by place" : @"image set by company";
        self.imageView.alpha = 0.5f;
    }
    
    self.image = [job getImage];
    if (self.image && self.image.image) {
        [self.imageActivity setHidden:false];
        [self.imageActivity startAnimating];
        self.imageView.image = nil;
        
        self.changeButton.enabled = false;
        self.changeButton.alpha = 0.5;
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
        self.imageActivity.hidden = true;
        self.noImage.text = @"";
        self.imageView.image = [UIImage imageNamed:@"no-img"];
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
