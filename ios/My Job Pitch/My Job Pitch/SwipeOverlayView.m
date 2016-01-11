//
//  SwipeViewOverlay.m
//  My Job Pitch
//
//  Created by user on 10/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "SwipeOverlayView.h"

@interface SwipeOverlayView ()
@property (nonatomic, strong) UIImageView *imageView;
@end

@implementation SwipeOverlayView

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (!self) return nil;
    
    self.backgroundColor = [UIColor whiteColor];
    self.imageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"trollface_300x200"]];
    [self addSubview:self.imageView];
    return self;
}

- (void)setMode:(SwipeOverlayViewMode)mode
{
    if (self->_mode == mode) return;
    
    if (mode == SwipeOverlayViewModeLeft) {
        self.imageView.image = [UIImage imageNamed:@"trollface_300x200"];
    } else {
        self.imageView.image = [UIImage imageNamed:@"thumbs_up_300x300"];
    }
}

- (void)layoutSubviews
{
    [super layoutSubviews];
    self.imageView.frame = CGRectMake(50, 50, 100, 100);
}

@end
