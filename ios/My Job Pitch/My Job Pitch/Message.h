//
//  Message.h
//  My Job Pitch
//
//  Created by user on 31/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "MJPObject.h"

@interface Message : MJPObject
@property bool system;
@property (nullable) NSString *content;
@property bool read;
@property (nullable) NSDate *created;
@property (nullable) NSNumber *application;
@property (nullable) NSNumber *fromRole;
@end

@interface MessageForCreation : MJPObject
@property (nullable) NSString *content;
@property (nullable) NSNumber *application;
@end
