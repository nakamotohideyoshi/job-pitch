#import <Foundation/Foundation.h>

@interface MJPObject : NSObject
@property (nullable) NSNumber* id;
- (Boolean)isEqual:(nullable MJPObject*)other;
@end
