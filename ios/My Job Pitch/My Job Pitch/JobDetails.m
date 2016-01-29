//
//  JobDetails.m
//  My Job Pitch
//
//  Created by user on 29/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "JobDetails.h"

@interface JobDetails ()

@end

@implementation JobDetails

- (void)viewDidLoad {
    [super viewDidLoad];
    self.jobTitle.text = self.job.title;
    [self showProgress:false];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
