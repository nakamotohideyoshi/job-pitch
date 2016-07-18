//
//  MessageThread.h
//  My Job Pitch
//
//  Created by user on 01/02/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ScrollingViewController.h"

@interface MessageThread : ScrollingViewController<UITableViewDelegate, UITableViewDataSource>

@property (nonnull) Application *application;

@property (weak, nonatomic) IBOutlet UIImageView *image;
@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *imageActivity;
@property (weak, nonatomic) IBOutlet UILabel *from;
@property (weak, nonatomic) IBOutlet UILabel *job;
@property (weak, nonatomic) IBOutlet UITableView *messages;
@property (weak, nonatomic) IBOutlet UITextView *messageInput;
@property (weak, nonatomic) IBOutlet UIButton *sendButton;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *tableBottomContraint;

- (IBAction)headerTap:(nullable id)sender;
- (IBAction)send:(nullable id)sender;

@end
