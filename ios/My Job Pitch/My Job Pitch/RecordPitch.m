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
#import "MyCameraViewController.h"

@import MediaPlayer;

@import AVKit;
@import AVFoundation;

@interface RecordPitch ()

@property (weak, nonatomic) IBOutlet UIView *popupView;
@property (weak, nonatomic) IBOutlet UISwitch *switchDontShow;

@property (nonnull) JobSeeker *jobSeeker;
@property (nonnull) Pitch *pitch;
@property (strong, nonatomic) NSURL *videoURL;

@property NSString *mp4Path;


@property (copy, nonatomic) AWSS3TransferUtilityUploadCompletionHandlerBlock completionHandler;
@property (copy, nonatomic) AWSS3TransferUtilityProgressBlock progressBlock;

@end

@implementation RecordPitch

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewDidLoad {
    
    [super viewDidLoad];
    [SVProgressHUD show];
    
    self.lblUploading.hidden = YES;
    self.lblProcessing.hidden = YES;
    self.loadingBar.hidden = YES;
    
    self.imageActivity.hidden = YES;
    
    self.playOverlay.hidden = YES;
    self.uploadButton.hidden = YES;
    self.recordCenterContraint.priority = UILayoutPriorityDefaultHigh;
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    if ([defaults boolForKey:@"dontshow"]) {
        _popupView.hidden = YES;
    } else {
        _popupView.layer.shadowColor = [UIColor blackColor].CGColor;
        _popupView.layer.shadowOffset = CGSizeMake(0, 3);
        _popupView.layer.shadowOpacity = 0.2;
        _popupView.layer.shadowRadius = 1.0;
    }
    
    [self.appDelegate.api loadJobSeekerWithId:self.appDelegate.user.jobSeeker
                                      success:^(JobSeeker *jobSeeker) {
                                          self.jobSeeker = jobSeeker;
                                          [SVProgressHUD dismiss];
                                          Pitch *pitch = [self.jobSeeker getPitch];
                                          if (pitch && pitch.thumbnail) {
                                              [self loadImageURL:pitch.thumbnail
                                                            into:self.image
                                                   withIndicator:self.imageActivity
                                                      completion:^{
                                                          if (self.videoURL) return;
                                                          self.pitch = pitch;
                                                          self.playOverlay.hidden = NO;
                                                      }];
                                          } else {
                                              self.noRecording.hidden = NO;
                                          }
                                      } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                          [MyAlertController showError:@"Error loading data" callback:^{
                                              [self.navigationController popViewControllerAnimated:true];
                                          }];
                                      }];
}

- (IBAction)playPitch:(id)sender {
    NSURL *url;
    if (self.videoURL) {
        url = self.videoURL;
    } else if (self.pitch && self.pitch.video) {
        url = [NSURL URLWithString:self.pitch.video];
    } else {
        return;
    }
    
    // create an AVPlayer
    AVPlayer *player = [AVPlayer playerWithURL:url];
    
    // create a player view controller
    AVPlayerViewController *controller = [[AVPlayerViewController alloc]init];
    controller.player = player;
    [player play];
    
    [self.navigationController pushViewController:controller animated:YES];

}

- (IBAction)recordPitch:(id)sender {
    
    if (self.videoURL) {
        [MyAlertController title:nil
                         message:@"You have a pitch recorded but not uploaded. A new recording will replace this"
                              ok:@"OK" okCallback:^{
                                  [self showCamera];
                              } cancel:@"Cancel" cancelCallback:nil];
    } else {
        [self showCamera];
    }

}

- (void)showCamera {
    
    MyCameraViewController *controller = [self.storyboard instantiateViewControllerWithIdentifier:@"MyCameraController"];
    controller.recordPitch = self;
    [self presentViewController:controller animated:YES completion:nil];
   
}

- (void)recordCompleted:(NSString*)url {
    
    self.videoURL = [NSURL URLWithString:url];
    
    MPMoviePlayerController *player = [[MPMoviePlayerController alloc] initWithContentURL: self.videoURL];
    self.image.image = [player thumbnailImageAtTime:1 timeOption:MPMovieTimeOptionExact];
    
    self.playOverlay.hidden = NO;
    self.noRecording.hidden = YES;
    self.imageActivity.hidden = YES;
    
    self.uploadButton.hidden = NO;
    self.recordCenterContraint.priority = UILayoutPriorityDefaultLow;
}

- (IBAction)videoUpload:(id)sender {
    
    if (self.loadingBar.hidden == NO) {
        [MyAlertController title:nil
                         message:@"This will cancel your current upload! Continue?"
                              ok:@"OK" okCallback:^{
                                  [self createPitch];
                              } cancel:@"Cancel" cancelCallback:nil];
    } else {
        [self createPitch];
    }
    
}

- (void) createPitch {
    
    self.lblUploading.hidden = NO;
    self.loadingBar.hidden = NO;
    self.lblProcessing.hidden = NO;
    
    self.uploadButton.enabled = NO;
    self.recordButton.enabled = NO;
    
    self.lblProcessing.text = @"processing...";
    
    __weak RecordPitch *weakSelf = self;
    Pitch *pitch = [[Pitch alloc] init];
    
    [self.appDelegate.api savePitch:pitch success:^(Pitch *pitch) {
        weakSelf.pitch = pitch;
        [weakSelf videoConvert];
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        [weakSelf uploadFailed];
    }];
    
}

- (void)videoConvert {
    
    AVURLAsset *avAsset = [AVURLAsset URLAssetWithURL:self.videoURL options:nil];
    NSArray *compatiblePresets = [AVAssetExportSession exportPresetsCompatibleWithAsset:avAsset];
    NSLog(@"%@", compatiblePresets);
    
    if ([compatiblePresets containsObject:AVAssetExportPresetLowQuality])
    {
        AVAssetExportSession *exportSession = [[AVAssetExportSession alloc]initWithAsset:avAsset
                                                                              presetName:AVAssetExportPresetLowQuality];
        NSLog(@"%@", exportSession.supportedFileTypes);
        
        NSDateFormatter* formater = [[NSDateFormatter alloc] init];
        [formater setDateFormat:@"yyyyMMddHHmmss"];
        self.mp4Path = [NSHomeDirectory() stringByAppendingFormat:@"/Documents/%@.mp4", [formater stringFromDate:[NSDate date]]];
        
        exportSession.outputURL = [NSURL fileURLWithPath: self.mp4Path];
        exportSession.shouldOptimizeForNetworkUse = YES;
        exportSession.outputFileType = AVFileTypeMPEG4;
        [exportSession exportAsynchronouslyWithCompletionHandler:^{
            if ([exportSession status] == AVAssetExportSessionStatusCompleted) {
                NSLog(@"Successful!");
                [self performSelectorOnMainThread:@selector(startUpload) withObject:nil waitUntilDone:NO];
            } else {
                NSLog(@"Export canceled");
            }
        }];
    } else {
        self.mp4Path = nil;
        [self startUpload];
    }
}

- (void) startUpload {

    __weak RecordPitch *weakSelf = self;
    
    self.completionHandler = ^(AWSS3TransferUtilityUploadTask *task, NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            if (error) {
                [weakSelf uploadFailed];
            } else {
                weakSelf.lblProcessing.text = @"processing...";
                [weakSelf getPitch];
            }
        });
    };
    
    self.progressBlock = ^(AWSS3TransferUtilityTask *task, NSProgress *progress) {
        dispatch_async(dispatch_get_main_queue(), ^{
            weakSelf.loadingBar.progress = progress.fractionCompleted;
            weakSelf.lblProcessing.text = [NSString stringWithFormat:@"%d%%", (int)(progress.fractionCompleted*100)];
        });
    };
    
    AWSS3TransferUtilityUploadExpression *expression = [AWSS3TransferUtilityUploadExpression new];
    expression.progressBlock = weakSelf.progressBlock;
    
    NSURL *mp4URL = self.mp4Path ? [NSURL URLWithString:[NSString stringWithFormat:@"file://localhost/private%@", self.mp4Path]] : self.videoURL;
    NSString *keyname = [NSString stringWithFormat:@"%@/%@.%@.%@", @"https:ec2-52-31-145-95.eu-west-1.compute.amazonaws.com", self.pitch.token, self.pitch.id, [mp4URL lastPathComponent]];
    
    AWSS3TransferUtility *transferUtility = [AWSS3TransferUtility defaultS3TransferUtility];
    [[transferUtility uploadFile:mp4URL
                          bucket:@"mjp-android-uploads"
                             key:keyname
                     contentType:(self.mp4Path ? @"video/mp4" : @"video/quicktime")
                      expression:expression
                completionHander:self.completionHandler] continueWithBlock:^id(AWSTask *task) {
        if (task.error || task.exception) {
            [weakSelf uploadFailed];
        }
        if (task.result) {
            dispatch_async(dispatch_get_main_queue(), ^{
            });
        }
        
        return nil;
        
    }];
}

- (void)getPitch {
    
    __weak RecordPitch *weakSelf = self;
    
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf.appDelegate.api getPitch:weakSelf.pitch.id success:^(Pitch *pitch) {
            if (pitch.video == nil) {
                [NSThread sleepForTimeInterval: 2];
                [weakSelf getPitch];
            } else {
                [weakSelf.navigationController popViewControllerAnimated:YES];
            }
        } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
            [NSThread sleepForTimeInterval: 2];
            [weakSelf getPitch];
        }];
    });
    
}

- (void) uploadFailed {
    
    self.lblUploading.hidden = YES;
    self.loadingBar.hidden = YES;
    self.lblProcessing.hidden = YES;
    
    self.uploadButton.enabled = YES;
    self.recordButton.enabled = YES;
    
    [MyAlertController title:nil
                     message:@"Failed to Upload"
                          ok:@"OK" okCallback:nil
                      cancel:nil cancelCallback:nil];
}

- (IBAction)onPopupClose:(id)sender {
    
    if (_switchDontShow.isOn) {
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
        [defaults setBool:YES forKey:@"dontshow"];
        [defaults synchronize];
    }

    _popupView.hidden = YES;
    
}

@end
