#import "Business.h"

@implementation Business

- (Image*)getImage
{
    if (self.images && self.images.count > 0) {
        return [self.images firstObject];
    }
    return nil;
}

@end
