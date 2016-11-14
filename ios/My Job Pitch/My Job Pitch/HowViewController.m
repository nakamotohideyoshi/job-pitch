//
//  HowViewController.m
//  MyJobPitch
//
//  Created by dev on 11/11/16.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "HowViewController.h"

@interface HowViewController ()

@property (weak, nonatomic) IBOutlet UIWebView *webView;

@end

@implementation HowViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    NSString* file = self.isJobSeeker ? @"jobseeker" : @"recruiter";
    NSString* path = [[NSBundle mainBundle] pathForResource:file ofType:@"html"];
    NSString* content = [NSString stringWithContentsOfFile:path
                                                  encoding:NSUTF8StringEncoding
                                                     error:NULL];
    [self.webView loadHTMLString:content baseURL:nil];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)next:(id)sender {
    [self dismissViewControllerAnimated:YES completion:nil];
    
    if (self.isJobSeeker) {
        [self.createProfile showJobSeeker];
    } else {
        [self.createProfile showRecruiter];
    }
}


@end
