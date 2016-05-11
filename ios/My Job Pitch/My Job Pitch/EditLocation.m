//
//  AddWorkPlace.m
//  My Job Pitch
//
//  Created by user on 11/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "EditLocation.h"

@interface EditLocation ()
@end

@implementation EditLocation

- (void)viewDidLoad
{
    if (self.location) {
        [locationEditView load:self.location];
    } else {
        self.location = [Location alloc];
        self.location.business = self.business.id;
    }
}

- (void)viewWillAppear:(BOOL)animated
{
    activityIndicator.hidden = true;
}

- (NSArray *)getRequiredFields {
    return @[@"name",
             @"description",
             @"location"];
}

- (NSDictionary*)getFieldMap {
    return @{@"name": locationEditView.name.textField,
             @"description": locationEditView.desc.textField,
             @"address": locationEditView.address.textField,
             @"email": locationEditView.email.textField,
             @"telephone": locationEditView.telephone.textField,
             @"mobile": locationEditView.mobile.textField,
             @"location": locationEditView.location.textField,
             };
}

- (NSDictionary *)getErrorViewMap {
    return @{@"name": locationEditView.name.errorLabel,
             @"description": locationEditView.desc.errorLabel,
             @"address": locationEditView.address.errorLabel,
             @"email": locationEditView.email.errorLabel,
             @"telephone": locationEditView.telephone.errorLabel,
             @"mobile": locationEditView.mobile.errorLabel,
             @"location": locationEditView.location.errorLabel,
             };
}

- (IBAction)continue:(id)sender {
    if ([self validate]) {
        [self showProgress:true];
        [locationEditView save:self.location];
        [[self appDelegate].api
         saveLocation:self.location
         success:^(Location *location) {
             [self clearErrors];
             self.location = location;
             [self continueLocationImage];
         }
         failure:^(RKObjectRequestOperation *operation, NSError *error, NSString*message, NSDictionary *errors) {
             [self handleErrors:errors message:message];
             [self showProgress:false];
         }];
    }
}

- (void)continueLocationImage
{
    if (locationEditView.imageForUpload) {
        [[self appDelegate].api uploadImage:locationEditView.imageForUpload
                                         to:@"user-location-images"
                                  objectKey:@"business"
                                   objectId:self.business.id
                                      order:@0
                                   progress:^(NSUInteger bytesWritten, long long totalBytesWritten, long long totalBytesExpectedToWrite) {
                                       double percent = ((double)totalBytesWritten/totalBytesExpectedToWrite)*100;
                                       [self.activityLabel setText:[NSString stringWithFormat:@"Uploading image (%ld%%)", lround(percent)]];
                                   }
                                    success:^(Image *image) {
                                        locationEditView.imageForUpload = nil;
                                        [self.activityLabel setText:@""];
                                        [self.navigationController popViewControllerAnimated:true];
                                    }
                                    failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                        [self handleErrors:errors message:message];
                                        [self showProgress:false];
                                    }
         ];
    } else {
        [self.navigationController popViewControllerAnimated:true];
    }
}


- (void)showProgress:(BOOL)showProgress
{
    [super showProgress:showProgress];
    [self.activityLabel setHidden:!showProgress];
    [self.activityLabel setText:@""];
}

@end
