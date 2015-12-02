//
//  API.h
//  My Job Pitch
//
//  Created by user on 25/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <RestKit/RestKit.h>
#import "AuthToken.h"
#import "User.h"

@interface API : NSObject

- (id)init;
- (id)initWithAPIRoot:(NSString*)apiRoot;
- (void)loginWithUsername:(NSString*)username
                 password:(NSString*)password
                  success:(void (^)(AuthToken *authToken))success
                  failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;
- (void)registerWithUsername:(NSString*)username
                   password1:(NSString*)password1
                   password2:(NSString*)password2
                     success:(void (^)(User *user))success
                     failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)getUser:(void (^)(User *user))success
        failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;
- (void)logout;

@end
