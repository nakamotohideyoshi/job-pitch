#import <Foundation/Foundation.h>
#import "MJPObject.h"

@interface Profile : MJPObject
@property NSNumber* jobSeeker;
@property MSArray* sectors;
@property (nullable) NSNumber* contract;
@property (nullable) NSNumber* hours;
@property (nullable) NSString* placeName;
@property (nullable) NSString* placeID;
@property (nullable) NSNumber* longitude;
@property (nullable) NSNumber* latitude;
@property (nullable) NSNumber* searchRadius;
@end
