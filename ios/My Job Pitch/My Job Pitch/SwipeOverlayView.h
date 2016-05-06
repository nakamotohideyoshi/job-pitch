//
//  SwipeViewOverlay.h
//  My Job Pitch
//
//  Created by user on 10/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>

typedef NS_ENUM(NSUInteger , SwipeOverlayViewMode) {
    SwipeOverlayViewModeLeft,
    SwipeOverlayViewModeRight
};

@interface SwipeOverlayView : UIView
@property (nonatomic) SwipeOverlayViewMode mode;
@end
