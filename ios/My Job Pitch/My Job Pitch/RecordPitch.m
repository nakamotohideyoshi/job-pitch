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

@import AVKit;
@import AVFoundation;

@interface RecordPitch ()
@property (nonnull) JobSeeker *jobSeeker;
@property (strong, nonatomic) NSURL *videoURL;
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
                                                          self.playOverlay.hidden = false;
                                                      }];
                                          } else {
                                              self.noRecording.hidden = false;
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
    if (self.jobSeeker) {
        Pitch *pitch = [self.jobSeeker getPitch];
        if (pitch && pitch.video) {
            [self performSegueWithIdentifier:@"play_video" sender:[NSURL URLWithString:pitch.video]];
            return;
        }
    }
    if (self.videoURL) {
        [self performSegueWithIdentifier:@"play_video" sender:self.videoURL];
        return;
    }
}

- (IBAction)recordPitch:(id)sender {
    
    if (self.videoURL) {
        [[[UIAlertView alloc] initWithTitle:@"Confirm"
                                    message:@"You have a pitch recorded but not uploaded. A new recording will replace this"
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
    
    self.videoURL = info[UIImagePickerControllerMediaURL];
    [picker dismissViewControllerAnimated:YES completion:NULL];
    
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
    
//    AWSS3TransferManager *transferManager = [AWSS3TransferManager defaultS3TransferManager];
//    AWSS3TransferManagerUploadRequest *uploadRequest = [AWSS3TransferManagerUploadRequest new];
//    uploadRequest.body = self.videoURL;
//    uploadRequest.bucket = @"mjp-android-uploads";
//    uploadRequest.contentType = @"video/mp4";
//    uploadRequest.key = @"ddddd";
//    
//    [[transferManager upload:uploadRequest] continueWithExecutor:[AWSExecutor mainThreadExecutor] withBlock:^id(AWSTask *task) {
//        if (task.error) {
//            if ([task.error.domain isEqualToString:AWSS3TransferManagerErrorDomain]) {
//                switch (task.error.code) {
//                    case AWSS3TransferManagerErrorCancelled:
//                    case AWSS3TransferManagerErrorPaused:
//                        break;
//                        
//                    default:
//                        NSLog(@"Error: %@", task.error);
//                        break;
//                }
//            } else {
//                // Unknown error.
//                NSLog(@"Error: %@", task.error);
//            }
//        }
//        
//        if (task.result)
//        {
//            NSLog(@"First photo uploaded");
//        }
//        return nil;
//    }];
    
    [self showProgress:true];
    Pitch *pitch = [[Pitch alloc] init];
    [self.appDelegate.api savePitch:pitch success:^(Pitch *pitch) {
        
        NSURL *fileURL = self.videoURL;
        NSString *keyname = [NSString stringWithFormat:@"%@%@.%d.%@", @"http:ec2-52-31-145-95.eu-west-1.compute.amazonaws.com", @"", [pitch.id intValue], [fileURL absoluteString]];
        
        AWSS3TransferUtility *transferUtility = [AWSS3TransferUtility defaultS3TransferUtility];
        [[transferUtility uploadFile:fileURL
                              bucket:@"mjp-android-uploads"
                                 key:keyname
                         contentType:@"video/mp4"
                          expression:nil
                    completionHander:nil] continueWithBlock:^id(AWSTask *task) {
            [self showProgress:false];
            if (task.error || task.exception) {
                [[[UIAlertView alloc] initWithTitle:@"Error"
                                            message:@"Error uploading video"
                                           delegate:self
                                  cancelButtonTitle:@"Okay"
                                  otherButtonTitles:nil] show];
            }
            if (task.result) {
                AWSS3TransferUtilityUploadTask *uploadTask = task.result;
            }
            
            return nil;
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
