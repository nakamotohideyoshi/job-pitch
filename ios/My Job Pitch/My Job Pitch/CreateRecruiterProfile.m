//
//  CreateRecruiterProfile.m
//  My Job Pitch
//
//  Created by user on 09/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "CreateRecruiterProfile.h"
#import "CreateProfile.h"

@interface CreateRecruiterProfile ()
@property (nonatomic, nonnull) Business* business;
@property (nonatomic, nonnull) Location *location;
@end

@implementation CreateRecruiterProfile

- (void)viewWillAppear:(BOOL)animated
{
    activityIndicator.hidden = YES;
}

- (NSArray *)getRequiredFields {
    return @[@"business_name",
             @"location_name",
             @"location_description",
             @"location_location"];
}

- (NSDictionary*)getFieldMap {
    return @{@"business_name": businessEditView.name.textField,
             @"location_name": locationEditView.name.textField,
             @"location_description": locationEditView.desc.textField,
             @"location_address": locationEditView.address.textField,
             @"location_email": locationEditView.email.textField,
             @"location_telephone": locationEditView.telephone.textField,
             @"location_mobile": locationEditView.mobile.textField,
             @"location_location": locationEditView.location.textField,
             };
}

- (NSDictionary *)getErrorViewMap {
    return @{@"business_name": businessEditView.name.errorLabel,
             @"location_name": locationEditView.name.errorLabel,
             @"location_description": locationEditView.desc.errorLabel,
             @"location_address": locationEditView.address.errorLabel,
             @"location_email": locationEditView.email.errorLabel,
             @"location_telephone": locationEditView.telephone.errorLabel,
             @"location_mobile": locationEditView.mobile.errorLabel,
             @"location_location": locationEditView.location.errorLabel,
             };
}

- (IBAction)continue
{
    NSLog(@"continue");
    if ([self validate]) {
        [self showProgress:true];
        if ([self appDelegate].user.businesses == nil || [[self appDelegate].user.businesses count] > 0) {
            [self continueBusinessImage];
        } else {
            Business *business = [Business alloc];
            [businessEditView save:business];
            [[self appDelegate].api
             saveBusiness:business
             success:^(Business *business) {
                 [self clearErrors];
                 [businessEditView setAlpha:0.5];
                 [businessEditView setUserInteractionEnabled:false];
                 [self appDelegate].user.businesses = @[business.id];
                 self.business = business;
                 [self continueBusinessImage];
             }
             failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                 NSMutableDictionary *detail = [[NSMutableDictionary alloc] init];
                 for (id key in errors)
                     detail[[NSString stringWithFormat:@"business_%@", key]] = errors[key];
                 [self handleErrors:detail message:message];
                 [self showProgress:false];
             }];
        }
    }
}

- (void)continueBusinessImage
{
    if (businessEditView.imageForUpload) {
        [[self appDelegate].api uploadImage:businessEditView.imageForUpload
                                         to:@"user-business-images"
                                  objectKey:@"business"
                                   objectId:self.business.id
                                      order:@0
                                   progress:^(NSUInteger bytesWritten, long long totalBytesWritten, long long totalBytesExpectedToWrite) {
                                       double percent = ((double)totalBytesWritten/totalBytesExpectedToWrite)*100;
                                       [self.activityLabel setText:[NSString stringWithFormat:@"Uploading image (%ld%%)", lround(percent)]];
                                   }
                                    success:^(Image *image) {
                                        businessEditView.imageForUpload = nil;
                                        [self.activityLabel setText:@""];
                                        [self continueLocation];
                                    }
                                    failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                        [self handleErrors:errors message:message];
                                        [self showProgress:false];
                                    }
         ];
    } else {
        [self continueLocation];
    }
}

- (void)continueLocation
{
    if (self.location == nil) {
        Location *location = [Location alloc];
        [locationEditView save:location];
        location.business = self.business.id;
        [[self appDelegate].api
         saveLocation:location
         success:^(Location *location) {
             [self clearErrors];
             self.location = location;
             [self continueLocationImage];
         }
         failure:^(RKObjectRequestOperation *operation, NSError *error, NSString*message, NSDictionary *errors) {
             NSMutableDictionary *detail = [[NSMutableDictionary alloc] init];
             for (id key in errors)
                 detail[[NSString stringWithFormat:@"location_%@", key]] = errors[key];
             [self handleErrors:detail message:message];
             [self showProgress:false];
         }];
    } else {
        [self continueLocationImage];
    }
}

- (void)continueLocationImage
{
    if (locationEditView.imageForUpload) {
        [[self appDelegate].api uploadImage:locationEditView.imageForUpload
                                         to:@"user-business-images"
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
                                        [self replaceWithViewControllerNamed:@"recruiter_home"];
                                    }
                                    failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                        [self handleErrors:errors message:message];
                                        [self showProgress:false];
                                    }
         ];
    } else {
        [self replaceWithViewControllerNamed:@"recruiter_home"];
    }
}

- (void)replaceWithViewControllerNamed:(NSString*)name
{
    UIViewController *destinationController = [self.storyboard instantiateViewControllerWithIdentifier:name];
    [self.navigationController pushViewController:destinationController animated:YES];
    NSMutableArray *navigationArray = [[NSMutableArray alloc] initWithArray: self.navigationController.viewControllers];
    for (id vc in self.navigationController.viewControllers)
        if ([vc isKindOfClass:[CreateProfile class]] || [vc isKindOfClass:[CreateRecruiterProfile class]])
            [navigationArray removeObject:vc];
    self.navigationController.viewControllers = navigationArray;
}

- (void)showProgress:(BOOL)showProgress
{
    [super showProgress:showProgress];
    [self.activityLabel setHidden:!showProgress];
    [self.activityLabel setText:@""];
}

@end
