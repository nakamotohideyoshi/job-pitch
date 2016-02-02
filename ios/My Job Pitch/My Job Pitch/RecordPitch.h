//
//  RecordPitch.h
//  My Job Pitch
//
//  Created by user on 02/02/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "MJPViewController.h"

@interface RecordPitch : MJPViewController

@property (weak, nonatomic) IBOutlet UIButton *recordButton;
@property (weak, nonatomic) IBOutlet UIImageView *image;
@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *imageActivity;
@property (weak, nonatomic) IBOutlet UILabel *noRecording;
@property (weak, nonatomic) IBOutlet UIImageView *playOverlay;

- (IBAction)recordPitch:(id)sender;

@end
