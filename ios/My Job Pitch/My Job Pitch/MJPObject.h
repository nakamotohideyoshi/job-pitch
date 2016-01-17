#import <Foundation/Foundation.h>

@interface MJPObject : NSObject
@property NSNumber* id;
- (Boolean)isEqual:(MJPObject*)other;
@end
