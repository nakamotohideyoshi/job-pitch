//
//  Job.h
//  My Job Pitch
//
//  Created by user on 12/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "MJPObjectWithDates.h"
#import "Location.h"

@interface Job : MJPObjectWithDates

@property (nullable) NSString* title;
@property (nullable) NSString* desc;
@property (nullable) NSNumber* sector;
@property (nullable) NSNumber* location;
@property (nullable) NSNumber* contract;
@property (nullable) NSNumber* hours;
@property (nullable) NSNumber* status;
@property (nullable) Location* locationData;
@property (nullable) NSArray* images;

@end
