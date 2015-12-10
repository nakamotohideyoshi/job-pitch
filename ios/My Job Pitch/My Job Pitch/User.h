//
//  User.h
//  My Job Pitch
//
//  Created by user on 29/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "MJPObject.h"

@interface User : MJPObject
@property NSString* username;
@property NSArray* businesses;
@property NSNumber* jobSeeker;
@end
