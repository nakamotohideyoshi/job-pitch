//
//  RecordPitch.h
//  My Job Pitch
//
//  Created by user on 02/02/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "MJPViewController.h"

@interface RecordPitch : MJPViewController<UIImagePickerControllerDelegate, UINavigationControllerDelegate>

@property (weak, nonatomic) IBOutlet UIButton *recordButton;
@property (weak, nonatomic) IBOutlet UIImageView *image;
@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *imageActivity;
@property (weak, nonatomic) IBOutlet UILabel *noRecording;
@property (weak, nonatomic) IBOutlet UIImageView *playOverlay;

@property (weak, nonatomic) IBOutlet UIButton *uploadButton;
@property (weak, nonatomic) IBOutlet UIButton *recordButton1;

@property (weak, nonatomic) IBOutlet UILabel *lblUploading;
@property (weak, nonatomic) IBOutlet UIProgressView *loadingBar;
@property (weak, nonatomic) IBOutlet UILabel *lblProcessing;

- (IBAction)recordPitch:(id)sender;

@end
