//
//  ApplicationStatus.h
//  My Job Pitch
//
//  Created by user on 17/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "MJPObjectWithNameDesc.h"

extern NSString *const APPLICATION_CREATED;
extern NSString *const APPLICATION_ESTABLISHED;
extern NSString *const APPLICATION_DELETED;

@interface ApplicationStatus : MJPObjectWithNameDesc
@property NSString* friendlyName;
@end
