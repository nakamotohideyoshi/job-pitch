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
                                           if (cancelCallback) {
                                               cancelCallback();
                                           }
                                       }];
        
        [alert addAction:action];
    }
    
    [[AppHelper getCurrentVC] presentViewController:alert animated:YES completion:nil];
    
}

+ (void)showError:(NSString*)message callback:(void(^)())callback {
    [SVProgressHUD dismiss];
    [MyAlertController title:@"Error"
                     message:message
                          ok:@"Okay"
                  okCallback:callback
                      cancel:nil
              cancelCallback:nil];
}

@end
