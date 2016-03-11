//
//  ListLocations.h
//  My Job Pitch
//
//  Created by user on 10/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "MJPViewController.h"

@interface ListLocations : MJPViewController<UITableViewDelegate, UITableViewDataSource>

@property (nonnull) Business *business;

@property (weak, nonatomic) IBOutlet UITableView *locations;

@end
