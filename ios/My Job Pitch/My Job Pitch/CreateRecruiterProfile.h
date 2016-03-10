//
//  CreateRecruiterProfile.h
//  My Job Pitch
//
//  Created by user on 09/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>

#import "ScrollingViewController.h"
#import "BusinessEditView.h"
#import "LocationEditView.h"

@interface CreateRecruiterProfile : ScrollingViewController {
    __weak IBOutlet BusinessEditView *businessEditView;
    __weak IBOutlet LocationEditView *locationEditView;

}

- (IBAction)continue;

@end
