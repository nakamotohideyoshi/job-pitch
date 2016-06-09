//
//  RecordPitch.m
//  My Job Pitch
//
//  Created by user on 02/02/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "RecordPitch.h"
#import <AWSS3/AWSS3.h>
#import "Pitch.h"

@import MediaPlayer;

@import AVKit;
@import AVFoundation;

@interface RecordPitch ()
@property (nonnull) JobSeeker *jobSeeker;
@property (strong, nonatomic) NSURL *videoURL;
@property (nonnull) Pitch *pitch;
@end

@implementation RecordPitch

- (void)viewDidLoad {
    [super viewDidLoad];
    [self showProgress:true];
    self.imageActivity.hidden = YES;
    self.playOverlay.hidden = YES;
    self.uploadButton.hidden = YES;
    self.recordButton1.hidden = YES;
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
                                                          self.pitch = pitch;
                                                          self.playOverlay.hidden = NO;
                                                      }];
                                          } else {
                                              self.noRecording.hidden = NO;
                                          }
                                      } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                          [self showProgress:false];
                                          [[[UIAlertView alloc] initWithTitle:@"Error"
                                                                     message:@"Error loading data"
                                                                    delegate:self
                                                           cancelButtonTitle:@"Okay"
                                                            otherButtonTitles:nil] show];
                                      }];
}

- (IBAction)playPitch:(id)sender {
    if (self.videoURL) {
        [self performSegueWithIdentifier:@"play_video" sender:[NSURL URLWithString:[self.videoURL absoluteString]]];
    } else if (self.pitch && self.pitch.video) {
        [self performSegueWithIdentifier:@"play_video" sender:[NSURL URLWithString:self.pitch.video]];
    }
}

- (IBAction)recordPitch:(id)sender {
    
    if (self.pitch && self.pitch.video) {
        [[[UIAlertView alloc] initWithTitle:@"Confirm"
                                    message:@"You have a pitch recorded. A new recording will replace this"
                                   delegate:self
                          cancelButtonTitle:@"Cancel"
                          otherButtonTitles:@"Ok", nil] show];
    } else {
        [self showCamera];
    }

}

- (void)showCamera {
    
    if ([UIImagePickerController isSourceTypeAvailable:UIImagePickerControllerSourceTypeCamera]) {
        
        NSArray *availableMediaTypes = [UIImagePickerController
                                        availableMediaTypesForSourceType:UIImagePickerControllerSourceTypeCamera];
        if ([availableMediaTypes containsObject:(NSString *)kUTTypeMovie]) {
            UIImagePickerController *camera = [[UIImagePickerController alloc] init];
            camera.delegate = self;
            camera.sourceType = UIImagePickerControllerSourceTypeCamera;
            camera.mediaTypes = @[(NSString *)kUTTypeMovie];
            camera.videoMaximumDuration = 30;
            if ([UIImagePickerController isCameraDeviceAvailable:UIImagePickerControllerCameraDeviceFront]) {
                camera.cameraDevice = UIImagePickerControllerCameraDeviceFront;
            }
            [self presentViewController:camera animated:YES completion:nil];
        } else {
            [[[UIAlertView alloc] initWithTitle:@"Not supported"
                                        message:@"Video recording is not supported on your device"
                                       delegate:nil
                              cancelButtonTitle:@"Dismiss"
                              otherButtonTitles:nil] show];
        }
    } else {
        [[[UIAlertView alloc] initWithTitle:@"Not supported"
                                    message:@"Video recording is not supported on your device"
                                   delegate:nil
                          cancelButtonTitle:@"Dismiss"
                          otherButtonTitles:nil] show];
    }
}

- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingMediaWithInfo:(NSDictionary *)info {
    
    [picker dismissViewControllerAnimated:YES completion:NULL];
    
    self.videoURL = info[UIImagePickerControllerMediaURL];
    
    MPMoviePlayerController *player = [[MPMoviePlayerController alloc] initWithContentURL: self.videoURL];
    self.image.image = [player thumbnailImageAtTime:1 timeOption:MPMovieTimeOptionExact];
    
    self.playOverlay.hidden = NO;
    self.noRecording.hidden = YES;
    
    self.uploadButton.hidden = NO;
    self.recordButton1.hidden = NO;
    self.recordButton.hidden = YES;
   
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker {
    
    [picker dismissViewControllerAnimated:YES completion:NULL];
    
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([segue.identifier isEqualToString:@"play_video"]) {
        AVPlayerViewController *playerViewController = segue.destinationViewController;
        playerViewController.player = [AVPlayer playerWithURL:sender];
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}
     
- (void)alertView:(UIAlertView *)alertView didDismissWithButtonIndex:(NSInteger)buttonIndex {
    if (buttonIndex == 1 && [alertView.message isEqualToString:@"Error loading data"]) {
        [self.navigationController popViewControllerAnimated:true];
        return;
    }
    
    if (buttonIndex == 1 && [alertView.title isEqualToString:@"Confirm"]) {
        [self showCamera];
    }
}

- (IBAction)videoUpload:(id)sender {
    
//    self.playOverlay.hidden = YES;
//    self.uploadButton.hidden = YES;
//    self.recordButton1.hidden = YES;
    
    [self showProgress:true];
    
    Pitch *pitch = [[Pitch alloc] init];
    [self.appDelegate.api savePitch:pitch success:^(Pitch *pitch) {
        
        self.pitch = pitch;
        
        AVURLAsset *avAsset = [AVURLAsset URLAssetWithURL:self.videoURL options:nil];
        AVAssetExportSession *exportSession = [[AVAssetExportSession alloc]initWithAsset:avAsset presetName:AVAssetExportPresetPassthrough];
        NSString *path = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
        NSString *videoPath = [NSString stringWithFormat:@"%@/%@.%@.mp4", path, pitch.token, pitch.id];
        exportSession.outputURL = [NSURL fileURLWithPath:videoPath];
        exportSession.outputFileType = AVFileTypeMPEG4;
        [exportSession exportAsynchronouslyWithCompletionHandler:^{
            if ([exportSession status] != AVAssetExportSessionStatusCompleted) {
                NSLog(@"Export failed: %@", [[exportSession error] localizedDescription]);
                [self showProgress:false];
                return;
            }
            
            UISaveVideoAtPathToSavedPhotosAlbum(videoPath, self, nil, nil);
                        
            AWSS3TransferUtilityUploadExpression *expression = [AWSS3TransferUtilityUploadExpression new];
            expression.uploadProgress = ^(AWSS3TransferUtilityTask *task, int64_t bytesSent, int64_t totalBytesSent, int64_t totalBytesExpectedToSend) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    // Do something e.g. Update a progress bar.
                });
            };
            
            AWSS3TransferUtilityUploadCompletionHandlerBlock completionHandler = ^(AWSS3TransferUtilityUploadTask *task, NSError *error) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    // Do something e.g. Alert a user for transfer completion.
                    // On failed uploads, `error` contains the error object.
                    [self showProgress:false];
                    if (error == nil) {
                        //                    [self.appDelegate.api getPitch:pitch.id success:^(Pitch *pitch) {
                        //                        Pitch *newPitch = pitch;
                        //                        int i = 0;
                        //                    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                        //
                        //                    }];
                    } else {
                        
                    }
                });
            };
            
            NSString *keyname = [NSString stringWithFormat:@"%@/%@.%@.%@", @"http:ec2-52-31-145-95.eu-west-1.compute.amazonaws.com", pitch.token, pitch.id, [self.videoURL lastPathComponent]];
            
            AWSS3TransferUtility *transferUtility = [AWSS3TransferUtility defaultS3TransferUtility];
            [[transferUtility uploadFile:self.videoURL
                                  bucket:@"mjp-android-uploads"
                                     key:keyname
                             contentType:@"video/mp4"
                              expression:expression
                        completionHander:completionHandler] continueWithBlock:^id(AWSTask *task) {
                if (task.error) {
                    NSLog(@"Error: %@", task.error);
                }
                if (task.exception) {
                    NSLog(@"Exception: %@", task.exception);
                    [[[UIAlertView alloc] initWithTitle:@"Error"
                                                message:@"Error uploading video"
                                               delegate:self
                                      cancelButtonTitle:@"Okay"
                                      otherButtonTitles:nil] show];
                }
                if (task.result) {
                    AWSS3TransferUtilityUploadTask *uploadTask = task.result;
                    // Do something with uploadTask.
                }
                
                return nil;
            }];
            
            
        }];
        
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        [self showProgress:false];
        [[[UIAlertView alloc] initWithTitle:@"Error"
                                    message:@"Error uploading video"
                                   delegate:self
                          cancelButtonTitle:@"Okay"
                          otherButtonTitles:nil] show];
        
    }];
    
}

@end
