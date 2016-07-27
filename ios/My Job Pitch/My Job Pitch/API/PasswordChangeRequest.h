//
//  RegisterRequest.h
//  My Job Pitch
//
//  Created by user on 29/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface PasswordChangeRequest : NSObject
@property NSString* email;
@property NSString* old_password;
@property NSString* password1;
@property NSString* password2;
@end
