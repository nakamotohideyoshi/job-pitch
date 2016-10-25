//
//  ToolTipHelper.m
//  MyJobPitch
//
//  Created by dev on 10/25/16.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ToolTipHelper.h"

@implementation ToolTipHelper  {
    
    NSArray *_data;
    UIView *_inView;
    void (^_callback)();
    
    int _step;
    CMPopTipView *_tip;
}

- (void) showStep {
    
    if (_step >= _data.count) {
        if (_callback) _callback();
        return;
    };
    
    NSDictionary *info = _data[_step];
    
    _tip = [[CMPopTipView alloc] initWithMessage:info[@"text"]];
    _tip.delegate = self;
    _tip.backgroundColor = [UIColor colorWithRed:0 green:150/255.0 blue:136/255.0 alpha:1];
    _tip.textColor = [UIColor whiteColor];
    _tip.borderColor = [UIColor colorWithRed:0 green:150/255.0 blue:136/255.0 alpha:1];
    _tip.shouldEnforceCustomViewPadding = 10;
    _tip.hasGradientBackground = NO;
    _tip.has3DStyle = NO;
    _tip.dismissTapAnywhere = YES;
    
    NSString *direction = info[@"dir"];
    if (direction) {
        if ([direction isEqualToString:@"up"]) {
            _tip.preferredPointDirection = PointDirectionUp;
        } if ([direction isEqualToString:@"down"]) {
            _tip.preferredPointDirection = PointDirectionDown;
        }
    }
    
    CGPoint offset = CGPointZero;
    NSNumber *dx = info[@"dx"];
    NSNumber *dy = info[@"dy"];
    if (dx) offset.x = [dx intValue];
    if (dy) offset.y = [dy intValue];
    
    [_tip presentPointingAtView:info[@"target"] offset:offset inView:_inView animated:YES];
    _tip.delegate = self;
}

- (void)popTipViewWasDismissedByUser:(CMPopTipView *)popTipView {
    _step++;
    [self showStep];
}

- (void) show:(NSArray *)data inView:(UIView *)inView callback:(void (^)())callback {
    _data = data;
    _inView = inView;
    _callback = callback;
    
    _step = 0;
    [self showStep];
}

- (void) hide {
    if (_tip != nil) {
        [_tip dismissAnimated:NO];
    }
}

+ (ToolTipHelper *) tooltip:(NSArray *)data inView:(UIView *)inView callback:(void (^)())callback {
    ToolTipHelper *helper = [[ToolTipHelper alloc] init];
    [helper show:data inView:inView callback: callback];
    return helper;
}

@end
