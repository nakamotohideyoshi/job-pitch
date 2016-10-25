//
//  ToolTipHelper.h
//  MyJobPitch
//
//  Created by dev on 10/25/16.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CMPopTipView.h"

@interface ToolTipHelper : NSObject <CMPopTipViewDelegate>

- (void) show:(NSArray *)data inView:(UIView *)inView callback:(void (^)())callback;
- (void) hide;
+ (ToolTipHelper *) tooltip:(NSArray *)data inView:(UIView *)inView callback:(void (^)())callback;

@end
