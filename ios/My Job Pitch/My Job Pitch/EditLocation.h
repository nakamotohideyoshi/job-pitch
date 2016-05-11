//
//  AddWorkPlace.h
//  My Job Pitch
//
//  Created by user on 11/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "ScrollingViewController.h"
#import "LocationEditView.h"

@interface EditLocation : ScrollingViewController {
    __weak IBOutlet LocationEditView *locationEditView;
    
}

@property (nonatomic, nonnull) Business *business;
@property (nonatomic, nonnull) Location *location;
@property (weak, nonatomic) IBOutlet UILabel *activityLabel;

- (IBAction)continue:(nullable id)sender;

@end
