//
//  EditJob.m
//  My Job Pitch
//
//  Created by user on 13/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "EditJob.h"
#import "JobEditView.h"

@interface EditJob ()

@property (weak, nonatomic) IBOutlet JobEditView *jobEditView;
@property (weak, nonatomic) IBOutlet UILabel *activityLabel;
@property (weak, nonatomic) IBOutlet UIButton *saveButton;

@end

@implementation EditJob

- (void)viewDidLoad {
    [super viewDidLoad];
    
    [_jobEditView setContractOptions:self.appDelegate.contracts];
    [_jobEditView setHoursOptions:self.appDelegate.hours];
    [_jobEditView setSectorOptions:self.appDelegate.sectors];
    [_jobEditView setStatusOptions:self.appDelegate.jobStatuses];
    
    if (self.job) {
        [_jobEditView load:self.job];
    } else {
        self.job = [Job alloc];
        self.job.location = self.location.id;
    }
}

- (void)viewWillAppear:(BOOL)animated {
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
    return @{@"title": _jobEditView.title.textField,
             @"description": _jobEditView.descriptionView,
             @"sector": _jobEditView.sector.textField,
             @"hours": _jobEditView.hours.textField,
             @"contract": _jobEditView.contract.textField,
             };
}

- (NSDictionary *)getErrorViewMap {
    return @{@"title": _jobEditView.title.errorLabel,
             @"description": _jobEditView.descriptionError,
             @"sector": _jobEditView.sector.errorLabel,
             @"hours": _jobEditView.hours.errorLabel,
             @"contract": _jobEditView.contract.errorLabel,
             };
}

- (IBAction)save:(id)sender {
    if ([self validate]) {
        [self showProgress:true];
        [_jobEditView save:self.job];
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
    if (_jobEditView.imageForUpload) {
        [[self appDelegate].api uploadImage:_jobEditView.imageForUpload
                                         to:@"user-job-images"
                                  objectKey:@"job"
                                   objectId:self.job.id
                                      order:@0
                                   progress:^(NSUInteger bytesWritten, long long totalBytesWritten, long long totalBytesExpectedToWrite) {
                                       double percent = ((double)totalBytesWritten/totalBytesExpectedToWrite)*100;
                                       [self.activityLabel setText:[NSString stringWithFormat:@"Uploading image (%ld%%)", lround(percent)]];
                                   }
                                    success:^(Image *image) {
                                        _jobEditView.imageForUpload = nil;
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
