//
//  MyAlertController.m
//  MyJobPitch
//
//  Created by dev on 6/13/16.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "MyAlertController.h"

@interface MyAlertController ()

@end

@implementation MyAlertController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


- (UIInterfaceOrientationMask)supportedInterfaceOrientations {
    return UIInterfaceOrientationMaskPortrait;
}

- (BOOL)shouldAutorotate {
    return false;
}

+ (void)title:(NSString*)title message:(NSString*)message
           ok:(NSString*)ok okCallback:(void(^)())okCallback
       cancel:(NSString*)cancel cancelCallback:(void(^)())cancelCallback {
    
    MyAlertController * alert=   [MyAlertController
                                  alertControllerWithTitle:title
                                  message:message
                                  preferredStyle:UIAlertControllerStyleAlert];
    
    if (ok) {
        UIAlertAction* action = [UIAlertAction
                                   actionWithTitle:ok
                                   style:UIAlertActionStyleDefault
                                   handler:^(UIAlertAction * action) {
                                       [alert dismissViewControllerAnimated:YES completion:nil];
                                       if (okCallback) {
                                           okCallback();
                                       }
                                   }];
        [alert addAction:action];
    }
    
    if (cancel) {
        UIAlertAction* action = [UIAlertAction
                                       actionWithTitle:cancel
                                       style:UIAlertActionStyleDefault
                                       handler:^(UIAlertAction * action) {
                                           [alert dismissViewControllerAnimated:YES completion:nil];
                                           if (cancelCallback) {
                                               cancelCallback();
                                           }
                                       }];
        
        [alert addAction:action];
    }
    
    [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:alert animated:YES completion:nil];
    
}

@end
