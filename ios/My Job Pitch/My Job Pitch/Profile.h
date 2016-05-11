#import <Foundation/Foundation.h>
#import "MJPObjectWithDates.h"

@interface Profile : MJPObjectWithDates
@property (nonnull) NSNumber* jobSeeker;
@property (nonnull) NSArray* sectors;
@property (nullable) NSNumber* contract;
@property (nullable) NSNumber* hours;
@property (nullable) NSString* placeName;
@property (nullable) NSString* placeID;
@property (nullable) NSNumber* longitude;
@property (nullable) NSNumber* latitude;
@property (nullable) NSNumber* searchRadius;
@end
