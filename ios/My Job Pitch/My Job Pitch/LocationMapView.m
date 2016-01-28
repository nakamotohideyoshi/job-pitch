//
//  LocationMapView.m
//  My Job Pitch
//
//  Created by user on 28/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "LocationMapView.h"

@implementation LocationMapView

- (instancetype)initWithCoder:(NSCoder *)aDecoder
{
    if (self = [super initWithCoder:aDecoder]) {
        
        [self xibSetup];
    }
    return self;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {;
        [self xibSetup];
    }
    return self;
}

- (void)xibSetup
{
    UIView *view = [self loadViewFromNib];
    view.frame = self.bounds;
    view.autoresizingMask = UIViewAutoresizingFlexibleWidth|UIViewAutoresizingFlexibleHeight;
    
    
    GMSCameraPosition *camera = [GMSCameraPosition cameraWithLatitude:-33.86
                                                            longitude:151.20
                                                                 zoom:6];
    self.map.myLocationEnabled = YES;
    [self.map setCamera:camera];
    [self addSubview:view];
}

- (UIView*)loadViewFromNib
{
    NSBundle *bundle = [NSBundle bundleForClass:[self class]];
    UINib *nib = [UINib nibWithNibName:@"LocationMap" bundle:bundle];
    return [[nib instantiateWithOwner:self options:nil] objectAtIndex:0];
}


- (IBAction)select:(id)sender {
}
@end
