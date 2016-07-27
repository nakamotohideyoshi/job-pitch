//
//  User.m
//  My Job Pitch
//
//  Created by user on 29/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "User.h"

@implementation User

-(bool)isJobSeeker
{
    return self.jobSeeker != nil;
}

-(bool)isRecruiter
{
    return [self.businesses count] > 0;
}

@end
