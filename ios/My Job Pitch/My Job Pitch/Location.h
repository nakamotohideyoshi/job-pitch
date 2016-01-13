//
//  Location.h
//  My Job Pitch
//
//  Created by user on 12/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "MJPObjectWithDates.h"
#import "Business.h"

@interface Location : MJPObjectWithDates

@property (nullable) NSNumber* business;
@property (nullable) NSArray* jobs;
@property (nullable) NSString* name;
@property (nullable) NSString* desc;
@property (nullable) NSString* email;
@property (nullable) NSString* telephone;
@property (nullable) NSString* mobile;
@property bool emailPublic;
@property bool telephonePublic;
@property bool mobilePublic;
@property (nullable) NSString* placeName;
@property (nullable) NSString* placeID;
@property (nullable) NSNumber* longitude;
@property (nullable) NSNumber* latitude;
@property (nullable) NSString* address;
@property (nullable) NSArray* images;
@property (nullable) Business* businessData;

@end
