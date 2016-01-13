//
//  JobSeekerHome.m
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "JobSeekerHome.h"

@interface JobSeekerHome ()

@end

@implementation JobSeekerHome

- (void)viewDidLoad {
    [super viewDidLoad];
    self.swipeView.delegate = self;
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)connect {
    [self.swipeView swipeLeft:^{
        [self nextCard];
    } complete:^{
        
    }];
}

- (IBAction)dismiss {
    [self.swipeView swipeRight:^{
        [self nextCard];
    } complete:^{
        
    }];
}

- (IBAction)messages
{
    
}

- (IBAction)logout {
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Logout"
                                                    message:@"Are you sure you want to logout?"
                                                   delegate:self
                                          cancelButtonTitle:@"No"
                                          otherButtonTitles:@"Yes", nil];
    [alert show];
}

- (IBAction)editProfile {
    [self performSegueWithIdentifier:@"goto_edit_profile" sender:@"home"];
}

- (IBAction)messages:(id)sender {
}

- (void)alertView:(UIAlertView *)alertView didDismissWithButtonIndex:(NSInteger)buttonIndex {
    if (buttonIndex == 1) {
        [self.navigationController popViewControllerAnimated:true];
    }
}

- (void)dragStarted
{
    self.dismissButton.enabled = false;
    self.connectButton.enabled = false;
}

- (void)updateDistance:(CGFloat)distance
{
    if (distance > 0) {
        self.directionLabel.text = @"Dismiss";
        self.directionLabel.textColor = [UIColor colorWithRed:0.7 green:0 blue:0 alpha:0.8];
    } else if (distance <= 0) {
        self.directionLabel.text = @"Connect";
        self.directionLabel.textColor = [UIColor colorWithRed:0.2 green:0.5 blue:0.1 alpha:0.8];
    }
    CGFloat overlayStrength = MIN(fabs(distance) / 60, 1.0);
    NSLog(@"alpha: %f", overlayStrength);
    self.directionLabel.alpha = overlayStrength;
}

- (void)dragComplete:(CGFloat)distance
{
    NSLog(@"complete: %f", distance);
    if (distance >= 80) {
        [self dismiss];
    } else if (distance <= -80) {
        [self connect];
    } else {
        [UIView animateWithDuration:0.2
                         animations:^{
                             self.directionLabel.alpha = 0;
                         }
         ];
        [self.swipeView returnToOrigin:^{
            self.directionLabel.alpha = 0;
            self.connectButton.enabled = true;
            self.dismissButton.enabled = true;
        }];
    }
}

- (void)nextCard
{
    self.connectButton.enabled = true;
    self.dismissButton.enabled = true;
    self.directionLabel.alpha = 0;
}

@end
