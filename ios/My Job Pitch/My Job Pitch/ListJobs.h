//
//  ListJobs.h
//  My Job Pitch
//
//  Created by user on 10/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "MJPViewController.h"

@interface ListJobs : MJPViewController<UITableViewDelegate, UITableViewDataSource>

@property (nonnull) Location *location;

@end
