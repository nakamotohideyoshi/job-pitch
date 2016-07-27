//
//  JobStatus.h
//  My Job Pitch
//
//  Created by user on 17/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "MJPObjectWithNameDesc.h"

extern NSString *const JOB_STATUS_OPEN;
extern NSString *const JOB_STATUS_CLOSED;

@interface JobStatus : MJPObjectWithNameDesc
@property NSString* friendlyName;
@end
