//
//  JobSeekerHome.h
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "MJPViewController.h"
#import "SwipeView.h"

@interface JobSeekerHome : MJPViewController<SwipeViewDelegate>

@property (weak, nonatomic) IBOutlet UIButton *dismissButton;
@property (weak, nonatomic) IBOutlet UIButton *connectButton;
@property (weak, nonatomic) IBOutlet UILabel *directionLabel;
@property (weak, nonatomic) IBOutlet UILabel *nameLabel;
@property (weak, nonatomic) IBOutlet UILabel *extraLabel;
@property (weak, nonatomic) IBOutlet UILabel *descriptionLabel;
@property (weak, nonatomic) IBOutlet SwipeView *swipeView;

- (IBAction)connect;
- (IBAction)dismiss;
- (IBAction)logout;
- (IBAction)editProfile;
- (IBAction)messages;

@end
