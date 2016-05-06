//
//  CreateProfile.h
//  My Job Pitch
//
//  Created by user on 01/12/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "MJPViewController.h"

@interface ScrollingViewController : MJPViewController {
    IBOutlet UIScrollView * scrollView;
    
@protected
    UITextField * activeField;
}

@end
