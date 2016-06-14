//
//  JobSeekerDetails.m
//  My Job Pitch
//
//  Created by user on 17/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "JobSeekerDetails.h"
#import "MessageThread.h"
@import AVKit;
@import AVFoundation;

@interface JobSeekerDetails ()

@end

@implementation JobSeekerDetails

- (void)viewDidLoad {
    [super viewDidLoad];
    [self showProgress:false];
    self.name.text = [NSString stringWithFormat:@"%@ %@",
                      self.jobSeeker.firstName,
                      self.jobSeeker.lastName];
    Sex *sex = nil;
    if (self.jobSeeker.sex)
        sex = [self.appDelegate getSex:self.jobSeeker.sex];
    if (sex && self.jobSeeker.sexPublic && self.jobSeeker.age && self.jobSeeker.agePublic) {
        self.attributes.text = [NSString stringWithFormat:@"%@ %@.", self.jobSeeker.age, sex.shortName];
    } else if (sex && self.jobSeeker.sexPublic) {
        self.attributes.text = sex.shortName;
    } else if (self.jobSeeker.age && self.jobSeeker.agePublic) {
        self.attributes.text = [self.jobSeeker.age stringValue];
    } else {
        self.attributes.text = nil;
    }
    Pitch *pitch = [self.jobSeeker getPitch];
    if (pitch)
        [self loadImageURL:pitch.thumbnail into:self.jobSeekerImage withIndicator:self.jobSeekerImageActivity];
    
    Boolean showContactDetails = false;
    if (self.application != nil) {
        ApplicationStatus *applicationStatus = [self.appDelegate getApplicationStatus:self.application.status];
        if ([applicationStatus isEqual:[self.appDelegate getApplicationStatusByName:APPLICATION_ESTABLISHED]]) {
            showContactDetails = true;
        }
    }
    if (showContactDetails) {
        NSMutableArray *contactDetails = [[NSMutableArray alloc] init];
        if (self.jobSeeker.email != nil && self.jobSeeker.email.length && self.jobSeeker.emailPublic)
            [contactDetails addObject:self.jobSeeker.email];
        if (self.jobSeeker.telephone != nil && self.jobSeeker.telephone.length && self.jobSeeker.telephonePublic)
            [contactDetails addObject:self.jobSeeker.telephone];
        if (self.jobSeeker.mobile != nil && self.jobSeeker.mobile.length && self.jobSeeker.mobilePublic)
            [contactDetails addObject:self.jobSeeker.mobile];
        if (contactDetails.count > 0)
            self.contactDetails.text = [contactDetails componentsJoinedByString:@"\n"];
        else
            self.contactDetails.text = @"No contact details supplied.";
        self.messagesButton.hidden = false;
    } else {
        self.contactDetails.text = @"You cannot view contact details you have connected with this job seeker";
        self.messagesButton.hidden = true;
    }
    
    BOOL hasCV = self.jobSeeker.cv != nil && ![self.jobSeeker.cv isEqualToString:@""];
    if (hasCV || self.jobSeeker.hasReferences) {
        self.cvButton.hidden = !hasCV;
        self.lblReferencesAvailable.hidden = !self.jobSeeker.hasReferences;
    } else {
        self.cvView.hidden = YES;
    }
}

- (IBAction)playVideo:(id)sender {
    Pitch *pitch = [self.jobSeeker getPitch];
    if (pitch && pitch.video) {
        [self performSegueWithIdentifier:@"play_video" sender:pitch];
    }
}

- (IBAction)messages:(id)sender {
    [self performSegueWithIdentifier:@"goto_message_thread" sender:nil];
}

- (IBAction)downloadCV:(id)sender {
    if (self.jobSeeker.cv != nil && [self.jobSeeker.cv isEqualToString:@""]) {
        
    }
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([segue.identifier isEqualToString:@"play_video"]) {
        Pitch *pitch = sender;
        AVPlayerViewController *playerViewController = segue.destinationViewController;
        playerViewController.player = [AVPlayer playerWithURL:[NSURL URLWithString:pitch.video]];
    } else if ([[segue identifier] isEqualToString:@"goto_message_thread"]) {
        MessageThread *messageThreadView = [segue destinationViewController];
        [messageThreadView setApplication:self.application];
    }
}

@end
