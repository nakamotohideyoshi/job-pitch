#import <Foundation/Foundation.h>
#import "MJPObjectWithDates.h"
#import "Image.h"

@interface Business : MJPObjectWithDates
@property (nullable) NSString* name;
@property (nullable) NSArray* users;
@property (nullable) NSArray* locations;
@property (nullable) NSArray* images;
@property (nullable) NSNumber* tokens;

- (nullable Image*)getImage;

@end
