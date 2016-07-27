//
//  Location.m
//  My Job Pitch
//
//  Created by user on 12/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "Location.h"

@implementation Location

- (Image*)getImage
{
    if (self.images && self.images.count > 0) {
        return [self.images firstObject];
    } else {
        return [self.businessData getImage];
    }
}

@end
