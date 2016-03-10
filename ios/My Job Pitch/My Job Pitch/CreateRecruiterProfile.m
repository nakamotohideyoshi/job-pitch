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
        if ([self appDelegate].user.businesses == nil || [[self appDelegate].user.businesses count] > 0) {
            [self continueLocation];
        } else {
            Business *business = [Business alloc];
            [businessEditView save:business];
            [self showProgress:true];
            [[self appDelegate].api
             saveBusiness:business
             success:^(Business *business) {
                 [self clearErrors];
                 [businessEditView setAlpha:0.5];
                 [businessEditView setUserInteractionEnabled:false];
                 [self appDelegate].user.businesses = @[business.id];
                 self.business = business;
                 [self continueLocation];
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

- (void)continueLocation
{
    Location *location = [Location alloc];
    [locationEditView save:location];
    location.business = self.business.id;
    [[self appDelegate].api
     saveLocation:location
     success:^(Location *location) {
         [self clearErrors];
         [self replaceWithViewControllerNamed:@"recruiter_home"];
     }
     failure:^(RKObjectRequestOperation *operation, NSError *error, NSString*message, NSDictionary *errors) {
         NSMutableDictionary *detail = [[NSMutableDictionary alloc] init];
         for (id key in errors)
             detail[[NSString stringWithFormat:@"location_%@", key]] = errors[key];
         [self handleErrors:detail message:message];
         [self showProgress:false];
     }];
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

@end
