//
//  SwipeView.m
//  My Job Pitch
//
//  Created by user on 10/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "SwipeView.h"


@interface SwipeView ()
@property(nonatomic, strong) UIPanGestureRecognizer *panGestureRecognizer;
@end

@implementation SwipeView

- (instancetype)initWithCoder:(NSCoder *)aDecoder
{
    if (self = [super initWithCoder:aDecoder]) {
        [self commonInit];
    }
    return self;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {
        [self commonInit];
    }
    return self;
}

- (void)commonInit
{
    self.panGestureRecognizer = [[UIPanGestureRecognizer alloc] initWithTarget:self action:@selector(dragged:)];
    [self addGestureRecognizer:self.panGestureRecognizer];
}

- (void)dragged:(UIPanGestureRecognizer *)gestureRecognizer
{
    CGFloat xDistance = [gestureRecognizer translationInView:self].x;
    CGFloat yDistance = [gestureRecognizer translationInView:self].y;
    
    switch (gestureRecognizer.state) {
        case UIGestureRecognizerStateBegan:{
            [self.delegate dragStarted];
            break;
        };
        case UIGestureRecognizerStateChanged:{
            CGFloat rotationStrength = MIN(xDistance / 320, 1);
            CGFloat rotationAngel = (CGFloat) (2*M_PI/16 * rotationStrength);
            CGFloat scaleStrength = 1 - fabs(rotationStrength) / 4;
            CGFloat scale = MAX(scaleStrength, 0.93);
            CGAffineTransform transform = CGAffineTransformMakeRotation(rotationAngel);
            transform = CGAffineTransformTranslate(transform, xDistance, yDistance);
            transform = CGAffineTransformScale(transform, scale, scale);
            self.transform = transform;
            
            [self.delegate updateDistance:xDistance];
            
            break;
        };
        case UIGestureRecognizerStateEnded: {
            [self.delegate dragComplete:xDistance];
            break;
        };
        case UIGestureRecognizerStatePossible:break;
        case UIGestureRecognizerStateCancelled:break;
        case UIGestureRecognizerStateFailed:break;
    }
}

- (void)returnToOrigin:(void(^)())completion
{
    [UIView animateWithDuration:0.2
                     animations:^{
                         self.transform = CGAffineTransformMakeRotation(0);
                     }
                     completion:^(BOOL finished) {
                         completion();
                     }];
}

- (void)swipeRight:(void(^)())completion
{
    [UIView animateWithDuration:0.2
                     animations:^{
                         CGAffineTransform transform = CGAffineTransformMakeTranslation(self.transform.tx + 200, self.transform.ty);
                         transform = CGAffineTransformRotate(transform, -320);
                         self.transform = transform;
                         self.alpha = 0;
                     }
                     completion:^(BOOL finished) {
                         completion();
                     }];
}

- (void)swipeLeft:(void(^)())completion
{
    [UIView animateWithDuration:0.2
                     animations:^{
                         CGAffineTransform transform = CGAffineTransformMakeTranslation(self.transform.tx - 200, self.transform.ty);
                         transform = CGAffineTransformRotate(transform, 320);
                         self.transform = transform;
                         self.alpha = 0;
                     }
                     completion:^(BOOL finished) {
                         completion();
                     }];
}

- (void)nextCard:(void(^)())completion
{
    self.transform = CGAffineTransformMakeRotation(0);
    self.transform = CGAffineTransformConcat(CGAffineTransformMakeScale(0.8, 0.8),
                                             CGAffineTransformMakeTranslation(0, 100));
    self.alpha = 0.0;
    [UIView animateWithDuration:0.6
                     animations:^{
                         CGAffineTransform transform = CGAffineTransformMakeTranslation(0, 0);
                         transform = CGAffineTransformScale(transform, 1.0, 1.0);
                         self.transform = transform;
                         self.alpha = 1.0;
                     }
                     completion:^(BOOL finished) {
                         completion();
                     }];
}

- (void)dealloc
{
    [self removeGestureRecognizer:self.panGestureRecognizer];
}

@end
