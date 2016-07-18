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
@property NSString* email;
@property NSArray* businesses;
@property NSNumber* jobSeeker;

-(bool)isJobSeeker;
-(bool)isRecruiter;

@end
