//
//  EditJob.m
//  My Job Pitch
//
//  Created by user on 13/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "EditJob.h"

@interface EditJob ()
@end

@implementation EditJob

- (void)viewDidLoad
{
    if (self.job) {
        [jobEditView load:self.job];
    } else {
        self.job = [Job alloc];
        self.job.location = self.location.id;
    }
    [jobEditView setContractOptions:self.appDelegate.contracts];
    [jobEditView setHoursOptions:self.appDelegate.hours];
    [jobEditView setSectorOptions:self.appDelegate.sectors];
    [jobEditView setStatusOptions:self.appDelegate.jobStatuses];
}

- (void)viewWillAppear:(BOOL)animated
{
    activityIndicator.hidden = true;
}

- (NSArray *)getRequiredFields {
    return @[@"title",
             @"description",
             @"sector",
             @"hours",
             @"contract",
             ];
}

- (NSDictionary*)getFieldMap {
    return @{@"title": jobEditView.title.textField,
             @"description": jobEditView.descriptionView,
             @"sector": jobEditView.sector.textField,
             @"hours": jobEditView.hours.textField,
             @"contract": jobEditView.contract.textField,
             };
}

- (NSDictionary *)getErrorViewMap {
    return @{@"title": jobEditView.title.errorLabel,
             @"description": jobEditView.descriptionError,
             @"sector": jobEditView.sector.errorLabel,
             @"hours": jobEditView.hours.errorLabel,
             @"contract": jobEditView.contract.errorLabel,
             };
}

- (IBAction)continue:(id)sender {
    if ([self validate]) {
        [self showProgress:true];
        [jobEditView save:self.job];
        [[self appDelegate].api
         saveJob:self.job
         success:^(Job *job) {
             [self clearErrors];
             self.job = job;
             [self continueJobImage];
         }
         failure:^(RKObjectRequestOperation *operation, NSError *error, NSString*message, NSDictionary *errors) {
             [self handleErrors:errors message:message];
             [self showProgress:false];
         }];
    }
}

- (void)continueJobImage
{
    if (jobEditView.imageForUpload) {
        [[self appDelegate].api uploadImage:jobEditView.imageForUpload
                                         to:@"user-job-images"
                                  objectKey:@"job"
                                   objectId:self.job.id
                                      order:@0
                                   progress:^(NSUInteger bytesWritten, long long totalBytesWritten, long long totalBytesExpectedToWrite) {
                                       double percent = ((double)totalBytesWritten/totalBytesExpectedToWrite)*100;
                                       [self.activityLabel setText:[NSString stringWithFormat:@"Uploading image (%ld%%)", lround(percent)]];
                                   }
                                    success:^(Image *image) {
                                        jobEditView.imageForUpload = nil;
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
