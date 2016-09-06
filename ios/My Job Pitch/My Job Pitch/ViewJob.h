//
//  ViewJob.h
//  My Job Pitch
//
//  Created by user on 13/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "MJPViewController.h"
#import "SwipeView.h"

typedef NS_ENUM(NSInteger, JobViewMode) {
    JobViewModeSearch = 0,
    JobViewModeApplications,
    JobViewModeConnections,
    JobViewModeMyShort,
};

@interface ViewJob : MJPViewController<SwipeViewDelegate>

@property (nonnull, nonatomic) Job *job;
@property JobViewMode mode;

@property (weak, nonatomic) IBOutlet UIView *emptyView;
@property (weak, nonatomic) IBOutlet UILabel *emptyLabel;
@property (weak, nonatomic) IBOutlet UIButton *emptyButton1;
@property (weak, nonatomic) IBOutlet UIButton *emptyButton2;
@property (weak, nonatomic) IBOutlet UIButton *emptyButton3;

@property (weak, nonatomic) IBOutlet UISwitch *shortlisted;
@property (weak, nonatomic) IBOutlet UILabel *shortlistedLabel;

@property (weak, nonatomic) IBOutlet UIView *swipeContainer;
@property (weak, nonatomic) IBOutlet SwipeView *swipeView;
@property (weak, nonatomic) IBOutlet UILabel *directionLabel;
@property (weak, nonatomic) IBOutlet UIImageView *image;
@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *imageActivity;
@property (weak, nonatomic) IBOutlet UILabel *nameLabel;
@property (weak, nonatomic) IBOutlet UILabel *extraLabel;
@property (weak, nonatomic) IBOutlet UILabel *descriptionLabel;
@property (weak, nonatomic) IBOutlet UIImageView *playIcon;
@property (weak, nonatomic) IBOutlet UIImageView *shortlistIcon;

@property (weak, nonatomic) IBOutlet UIButton *leftButton;
@property (weak, nonatomic) IBOutlet UIImageView *leftIcon;
@property (weak, nonatomic) IBOutlet UILabel *leftTitle;

@property (weak, nonatomic) IBOutlet UIButton *rightButton;
@property (weak, nonatomic) IBOutlet UIImageView *rightIcon;
@property (weak, nonatomic) IBOutlet UILabel *rightTitle;

@property (weak, nonatomic) IBOutlet UIButton *shortlistButton;
@property (weak, nonatomic) IBOutlet UIImageView *shortlistButtonIcon;
@property (weak, nonatomic) IBOutlet UILabel *tokensLabel;

@property (strong, nonatomic) NSString *strTitle;

@end
