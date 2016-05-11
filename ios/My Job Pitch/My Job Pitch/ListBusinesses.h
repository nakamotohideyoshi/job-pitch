//
//  RecruiterHomeViewController.h
//  My Job Pitch
//
//  Created by user on 02/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "ScrollingViewController.h"

@interface ListBusinesses : MJPViewController<UITableViewDelegate, UITableViewDataSource>

@property (weak, nonatomic) IBOutlet UITableView *businesses;

- (IBAction)logout;

@end
