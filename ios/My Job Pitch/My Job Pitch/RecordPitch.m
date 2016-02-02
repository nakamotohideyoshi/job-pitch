//
//  RecordPitch.m
//  My Job Pitch
//
//  Created by user on 02/02/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "RecordPitch.h"
@import AVKit;
@import AVFoundation;

@interface RecordPitch ()
@property (nonnull) JobSeeker *jobSeeker;
@end

@implementation RecordPitch

- (void)viewDidLoad {
    [super viewDidLoad];
    [self showProgress:true];
    self.imageActivity.hidden = true;
    self.playOverlay.hidden = true;
    [self.appDelegate.api loadJobSeekerWithId:self.appDelegate.user.jobSeeker
                                      success:^(JobSeeker *jobSeeker) {
                                          self.jobSeeker = jobSeeker;
                                          [self showProgress:false];
                                          Pitch *pitch = [self.jobSeeker getPitch];
                                          if (pitch && pitch.thumbnail) {
                                              [self loadImageURL:pitch.thumbnail
                                                            into:self.image
                                                   withIndicator:self.imageActivity
                                                      completion:^{
                                                          self.playOverlay.hidden = false;
                                                      }];
                                          } else {
                                              self.noRecording.hidden = false;
                                          }
                                      } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                          [[[UIAlertView alloc] initWithTitle:@"Error"
                                                                     message:@"Error loading data"
                                                                    delegate:self
                                                           cancelButtonTitle:@"Okay"
                                                            otherButtonTitles:nil] show];
                                      }];
}

- (IBAction)playPitch:(id)sender {
    if (self.jobSeeker) {
        Pitch *pitch = [self.jobSeeker getPitch];
        if (pitch && pitch.video) {
            [self performSegueWithIdentifier:@"play_video" sender:pitch];
        }
    }
}

- (IBAction)recordPitch:(id)sender {
    
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([segue.identifier isEqualToString:@"play_video"]) {
        Pitch *pitch = sender;
        AVPlayerViewController *playerViewController = segue.destinationViewController;
        playerViewController.player = [AVPlayer playerWithURL:[NSURL URLWithString:pitch.video]];
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}
     
- (void)alertView:(UIAlertView *)alertView didDismissWithButtonIndex:(NSInteger)buttonIndex {
    if (buttonIndex == 1 && [alertView.message isEqualToString:@"Error loading data"]) {
        [self.navigationController popViewControllerAnimated:true];
    }
}

@end
