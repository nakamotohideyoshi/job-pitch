//
//  SwipeView.h
//  My Job Pitch
//
//  Created by user on 10/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol SwipeViewDelegate
- (void)dragStarted;
- (void)updateDistance:(CGFloat)distance;
- (void)dragComplete:(CGFloat)distance;
@end

@interface SwipeView : UIView
@property (weak, nonatomic, nullable) id<SwipeViewDelegate> delegate;

- (void)returnToOrigin:(void(^_Nonnull)())completion;
- (void)swipeRight:(void(^_Nonnull)())nextCard complete:(void(^_Nonnull)())completion;
- (void)swipeLeft:(void(^_Nonnull)())nextCard complete:(void(^_Nonnull)())completion;

@end
