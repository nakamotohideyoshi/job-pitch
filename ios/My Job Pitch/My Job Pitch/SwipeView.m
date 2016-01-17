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
@property(nonatomic) CGPoint originalPoint;
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
            self.originalPoint = self.center;
            [self.delegate dragStarted];
            break;
        };
        case UIGestureRecognizerStateChanged:{
            CGFloat rotationStrength = MIN(xDistance / 320, 1);
            CGFloat rotationAngel = (CGFloat) (2*M_PI/16 * rotationStrength);
            CGFloat scaleStrength = 1 - fabs(rotationStrength) / 4;
            CGFloat scale = MAX(scaleStrength, 0.93);
            CGAffineTransform transform = CGAffineTransformMakeRotation(rotationAngel);
            CGAffineTransform scaleTransform = CGAffineTransformScale(transform, scale, scale);
            self.transform = scaleTransform;
            self.center = CGPointMake(self.originalPoint.x + xDistance, self.originalPoint.y + yDistance);
            
            [self.delegate updateDistance:xDistance];
            
            break;
        };
        case UIGestureRecognizerStateEnded: {
            NSLog(@"original: %f, %f", self.originalPoint.x, self.originalPoint.y);
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
                         self.center = self.originalPoint;
                         self.transform = CGAffineTransformMakeRotation(0);
                     }
                     completion:^(BOOL finished) {
                         completion();
                     }];
}

- (void)swipeRight:(void(^)())completion
{
    if (self.originalPoint.x == 0 && self.originalPoint.y == 0)
        self.originalPoint = self.center;
    [UIView animateWithDuration:0.2
                     animations:^{
                         self.center = CGPointMake(self.originalPoint.x + 300, self.center.y);
                         self.transform = CGAffineTransformMakeRotation(-320);
                         self.alpha = 0;
                     }
                     completion:^(BOOL finished) {
                         completion();
                     }];
}

- (void)swipeLeft:(void(^)())completion
{
    if (self.originalPoint.x == 0 && self.originalPoint.y == 0)
        self.originalPoint = self.center;
    [UIView animateWithDuration:0.2
                     animations:^{
                         self.center = CGPointMake(self.originalPoint.x - 300, self.center.y);
                         self.transform = CGAffineTransformMakeRotation(320);
                         self.alpha = 0;
                     }
                     completion:^(BOOL finished) {
                         completion();
                     }];
}

- (void)nextCard:(void(^)())completion
{
    self.transform = CGAffineTransformMakeRotation(0);
    self.transform = CGAffineTransformMakeScale(0.8, 0.8);
    self.center = CGPointMake(self.originalPoint.x, self.originalPoint.y + 100);
    [UIView animateWithDuration:0.4
                     animations:^{
                         self.transform = CGAffineTransformMakeScale(1.0, 1.0);
                         self.alpha = 1.0;
                         self.center = self.originalPoint;
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
