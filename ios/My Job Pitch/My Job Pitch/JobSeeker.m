#import "JobSeeker.h"

@implementation JobSeeker

-(Pitch*)getPitch
{
    if (self.pitches)
        for (Pitch *pitch in self.pitches)
            if (pitch.video)
                return pitch;
    return nil;
}

@end
