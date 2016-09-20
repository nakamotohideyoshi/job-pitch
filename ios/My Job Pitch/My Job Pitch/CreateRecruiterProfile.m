//
//  CreateRecruiterProfile.m
//  My Job Pitch
//
//  Created by user on 09/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "BusinessEditView.h"
#import "LocationEditView.h"
#import "CreateRecruiterProfile.h"
#import "CreateProfile.h"
#import "ListLocations.h"

@interface CreateRecruiterProfile ()

@property (weak, nonatomic) IBOutlet NSLayoutConstraint *layoutBusinessHeight0;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *layoutLocationHeight0;
@property (weak, nonatomic) IBOutlet BusinessEditView *businessEditView;
@property (weak, nonatomic) IBOutlet LocationEditView *locationEditView;
@property (weak, nonatomic) IBOutlet UIButton *saveButton;
@property (weak, nonatomic) IBOutlet UILabel *activityLabel;

@end

@implementation CreateRecruiterProfile

- (void) viewDidLoad {
    [super viewDidLoad];
    
    _businessEditView.hidden = _hiddenBusiness;
    _layoutBusinessHeight0.active = _hiddenBusiness;
    if (!_businessEditView.hidden) {
        [_businessEditView load:_business];
        self.navigationItem.title = _business ? @"Edit Company" : @"Add Company";
    }
    
    _locationEditView.hidden = _hiddenLocation;
    _layoutLocationHeight0.active = _hiddenLocation;
    if (!_locationEditView.hidden) {
        [_locationEditView load:_location];
        self.navigationItem.title = _location ?  @"Edit Work Place" : @"Add Work Place";
    }
}

- (NSArray *)getRequiredFields {
    
    if (_hiddenLocation) {
        return @[@"business_name"];
    }
    
    if (_hiddenBusiness) {
        return @[@"location_name",
                 @"location_description",
                 @"location_email",
                 @"location_location"];
    }
    
    return @[@"business_name",
             @"location_name",
             @"location_description",
             @"location_email",
             @"location_location"];
}

- (NSDictionary*)getFieldMap {
    
    if (_hiddenLocation) {
        return @{@"business_name": _businessEditView.name.textField };
    }
    
    if (_hiddenBusiness) {
        return @{@"location_name": _locationEditView.name.textField,
                 @"location_description": _locationEditView.desc.textField,
                 @"location_address": _locationEditView.address.textField,
                 @"location_email": _locationEditView.email.textField,
                 @"location_telephone": _locationEditView.telephone.textField,
                 @"location_mobile": _locationEditView.mobile.textField,
                 @"location_location": _locationEditView.location.textField };
    }
    
    return @{@"business_name": _businessEditView.name.textField,
             @"location_name": _locationEditView.name.textField,
             @"location_description": _locationEditView.desc.textField,
             @"location_address": _locationEditView.address.textField,
             @"location_email": _locationEditView.email.textField,
             @"location_telephone": _locationEditView.telephone.textField,
             @"location_mobile": _locationEditView.mobile.textField,
             @"location_location": _locationEditView.location.textField };
}

- (NSDictionary *)getErrorViewMap {
    
    if (_hiddenLocation) {
        return @{@"business_name": _businessEditView.name.errorLabel };
    }
    
    if (_hiddenBusiness) {
        return @{@"location_name": _locationEditView.name.errorLabel,
                 @"location_description": _locationEditView.desc.errorLabel,
                 @"location_address": _locationEditView.address.errorLabel,
                 @"location_email": _locationEditView.email.errorLabel,
                 @"location_telephone": _locationEditView.telephone.errorLabel,
                 @"location_mobile": _locationEditView.mobile.errorLabel,
                 @"location_location": _locationEditView.location.errorLabel };
    }
    
    return @{@"business_name": _businessEditView.name.errorLabel,
             @"location_name": _locationEditView.name.errorLabel,
             @"location_description": _locationEditView.desc.errorLabel,
             @"location_address": _locationEditView.address.errorLabel,
             @"location_email": _locationEditView.email.errorLabel,
             @"location_telephone": _locationEditView.telephone.errorLabel,
             @"location_mobile": _locationEditView.mobile.errorLabel,
             @"location_location": _locationEditView.location.errorLabel };
}

- (IBAction)save {
    
    if (![self validate]) return;
    
    [SVProgressHUD show];
    
    if (!_hiddenBusiness) {
        if (_business == nil) {
            _business = [Business alloc];
        }
        [_businessEditView save:_business];
        [[self appDelegate].api saveBusiness:_business
                                     success:^(Business *business) {
                                         [self clearErrors];
                                         [self.businessEditView setAlpha:0.5];
                                         [self.businessEditView setUserInteractionEnabled:false];
                                         [self appDelegate].user.businesses = @[business.id];
                                         self.business = business;
                                         
                                         UIImage *imageForUpload = self.businessEditView.imageForUpload;
                                         Image *originalImage = nil;
                                         if (self.business.images && self.business.images.count > 0) {
                                             originalImage = self.business.images[0];
                                         }
                                         
                                         if (originalImage == nil || imageForUpload != nil) {
                                             [self continueBusinessImage];
                                         } else if (imageForUpload == nil) {
                                             [[self appDelegate].api deleteImage:originalImage.id to:@"user-business-images" success:^{
                                                 [self continueBusinessImage];
                                             } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                                 [self handleErrors:errors message:message];
                                             }];
                                         }
                                     }
                                     failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                         NSMutableDictionary *detail = [[NSMutableDictionary alloc] init];
                                         for (id key in errors)
                                             detail[[NSString stringWithFormat:@"business_%@", key]] = errors[key];
                                         [self handleErrors:detail message:message];
                                     }];
    } else {
        [self continueLocation];
    }
}

- (void)continueBusinessImage {
    
    if (_businessEditView.imageForUpload) {
        [[self appDelegate].api uploadImage:_businessEditView.imageForUpload
                                         to:@"user-business-images"
                                  objectKey:@"business"
                                   objectId:self.business.id
                                      order:@0
                                   progress:^(NSUInteger bytesWritten, long long totalBytesWritten, long long totalBytesExpectedToWrite) {
                                       double percent = ((double)totalBytesWritten/totalBytesExpectedToWrite)*100;
                                       [self.activityLabel setText:[NSString stringWithFormat:@"Uploading image (%ld%%)", lround(percent)]];
                                   }
                                    success:^(Image *image) {
                                        self.businessEditView.imageForUpload = nil;
                                        [self.activityLabel setText:@""];
                                        [self continueLocation];
                                    }
                                    failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                        [self handleErrors:errors message:message];
                                    }
         ];
    } else {
        [self continueLocation];
    }
}

- (void)continueLocation {
    
    if (!_hiddenLocation) {
        if (_location == nil) {
            _location = [Location alloc];
            _location.business = _business.id;
        }
        [_locationEditView save:_location];
        
        [[self appDelegate].api saveLocation:_location
                                     success:^(Location *location) {
                                         [self clearErrors];
                                         self.location = location;
                                         
                                         UIImage *imageForUpload = self.locationEditView.imageForUpload;
                                         Image *originalImage = nil;
                                         if (self.location.images && self.location.images.count > 0) {
                                            originalImage = self.location.images[0];
                                         }
                                         
                                         if (originalImage == nil || imageForUpload != nil) {
                                             [self continueLocationImage];
                                         } else if (imageForUpload == nil) {
                                             [[self appDelegate].api deleteImage:originalImage.id to:@"user-location-images" success:^{
                                                 [self continueLocationImage];
                                             } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                                 [self handleErrors:errors message:message];
                                             }];
                                         }
                                     }
                                     failure:^(RKObjectRequestOperation *operation, NSError *error, NSString*message, NSDictionary *errors) {
                                         NSMutableDictionary *detail = [[NSMutableDictionary alloc] init];
                                         for (id key in errors)
                                             detail[[NSString stringWithFormat:@"location_%@", key]] = errors[key];
                                         [self handleErrors:detail message:message];
                                     }];
    } else {
        [self saveCompleted];
    }
}

- (void)continueLocationImage {
    
    if (_locationEditView.imageForUpload) {
        [[self appDelegate].api uploadImage:_locationEditView.imageForUpload
                                         to:@"user-location-images"
                                  objectKey:@"location"
                                   objectId:self.location.id
                                      order:@0
                                   progress:^(NSUInteger bytesWritten, long long totalBytesWritten, long long totalBytesExpectedToWrite) {
                                       double percent = ((double)totalBytesWritten/totalBytesExpectedToWrite)*100;
                                       [self.activityLabel setText:[NSString stringWithFormat:@"Uploading image (%ld%%)", lround(percent)]];
                                   }
                                    success:^(Image *image) {
                                        self.locationEditView.imageForUpload = nil;
                                        [self.activityLabel setText:@""];
                                        [self saveCompleted];
                                    }
                                    failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                        [self handleErrors:errors message:message];
                                    }
         ];
    } else {
        [self saveCompleted];
    }
}

- (void)saveCompleted {
    if (_isFirst) {
        User *user = [self appDelegate].user;
        if (user.canCreateBusinesses) {
            UIViewController *destinationController = [self.storyboard instantiateViewControllerWithIdentifier:@"recruiter_home"];
            [self.navigationController pushViewController:destinationController animated:YES];
        } else {
            ListLocations *listLocations = [self.storyboard instantiateViewControllerWithIdentifier:@"listLocations"];
            listLocations.business = self.business;
            [self.navigationController pushViewController:listLocations animated:YES];
        }
        NSMutableArray *navigationArray = [[NSMutableArray alloc] initWithArray: self.navigationController.viewControllers];
        for (id vc in self.navigationController.viewControllers)
            if ([vc isKindOfClass:[CreateProfile class]] || [vc isKindOfClass:[CreateRecruiterProfile class]])
                [navigationArray removeObject:vc];
        self.navigationController.viewControllers = navigationArray;
    } else {
        [self.navigationController popViewControllerAnimated:YES];
    }
    
}

@end
