//
//  JobDetails.m
//  My Job Pitch
//
//  Created by user on 29/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "JobDetails.h"
#import "Image.h"
#import "MessageThread.h"
@import MapKit;

@implementation JobDetails

- (void)viewDidLoad {
    [super viewDidLoad];
    
    Location *location = self.job.locationData;
    Business *business = location.businessData;
    Contract *contract = [self.appDelegate getContract:self.job.contract];
    Hours *hours = [self.appDelegate getHours:self.job.hours];
    Image *image = [self.job getImage];
    if (image && image.image)
        [self loadImageURL:image.image into:self.jobImage withIndicator:self.jobImageActivity];
    
    self.jobTitle.text = self.job.title;
    if (![contract isEqual:[self.appDelegate getContractByName:CONTRACT_PERMANENT]]) {
        self.attributes.text = [NSString stringWithFormat:@"%@ (%@)", hours.name, contract.shortName];
    } else {
        self.attributes.text = hours.name;
    }
    //[SVProgressHUD dismiss];
    self.jobBusinessLocation.text = [NSString stringWithFormat:@"%@: %@", business.name, location.name];
    self.jobDescription.text = self.job.desc;
    self.locationName.text = location.name;
    self.locationDescription.text = location.desc;
    
    Boolean showContactDetails = false;
    if (self.application != nil) {
        ApplicationStatus *applicationStatus = [self.appDelegate getApplicationStatus:self.application.status];
        if ([applicationStatus isEqual:[self.appDelegate getApplicationStatusByName:APPLICATION_ESTABLISHED]]) {
            showContactDetails = true;
        }
    }
    if (showContactDetails) {
        NSMutableArray *contactDetails = [[NSMutableArray alloc] init];
        if (location.email != nil && location.emailPublic)
            [contactDetails addObject:location.email];
        if (location.telephone != nil && location.telephonePublic)
            [contactDetails addObject:location.telephone];
        if (location.mobile != nil && location.mobilePublic)
            [contactDetails addObject:location.mobile];
        if (contactDetails.count > 0)
            self.contactDetails.text = [contactDetails componentsJoinedByString:@"\n"];
        else
            self.contactDetails.text = @"No contact details supplied.";
        self.messagesButton.hidden = false;
    } else {
        self.contactDetails.text = @"You cannot view contact details until your application has been accepted";
        self.messagesButton.hidden = true;
    }
    
    self.applyButton.hidden = self.jobSeekerHome == nil;
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)openMap:(id)sender {
    Location *location = self.job.locationData;
    CLLocationCoordinate2D coordinates = CLLocationCoordinate2DMake([location.latitude doubleValue],
                                                                    [location.longitude doubleValue]);
    MKPlacemark *placemark = [[MKPlacemark alloc] initWithCoordinate:coordinates
                                                     addressDictionary:nil];
    MKMapItem *mapItem = [[MKMapItem alloc] initWithPlacemark:placemark];
    [mapItem setName:location.name];
    [mapItem openInMapsWithLaunchOptions:@{}];
}

- (IBAction)messages:(id)sender {
    [self performSegueWithIdentifier:@"goto_message_thread" sender:nil];
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([[segue identifier] isEqualToString:@"goto_message_thread"]) {
        MessageThread *messageThreadView = [segue destinationViewController];
        [messageThreadView setApplication:self.application];
    }
}

- (IBAction)apply:(id)sender {
    ApplicationForCreation *application = [ApplicationForCreation alloc];
    application.job = self.job.id;
    application.jobSeeker = self.appDelegate.user.jobSeeker;
    application.shortlisted = false;
    [SVProgressHUD show];
    [self.appDelegate.api createApplication:application
                                    success:^(ApplicationForCreation *application) {
                                        NSLog(@"Application created %@", application);
                                        [SVProgressHUD dismiss];
                                        [self.jobSeekerHome nextCard];
                                        [self.navigationController popViewControllerAnimated:YES];
                                    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                        [MyAlertController showError:@"Error creating data" callback:nil];
                                    }];
}

@end
