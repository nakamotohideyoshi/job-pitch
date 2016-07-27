#import "User.h"

@implementation MJPObject

- (Boolean)isEqual:(MJPObject*)other
{
    if (other == nil)
        return false;
    return self.id == other.id;
}

@end
