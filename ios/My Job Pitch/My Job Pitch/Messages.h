//
//  Messages.h
//  My Job Pitch
//
//  Created by user on 31/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "MJPViewController.h"

@interface Messages : MJPViewController<UITableViewDelegate, UITableViewDataSource>
@property (weak, nonatomic) IBOutlet UITableView *messages;
@end
