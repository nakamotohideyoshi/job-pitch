//
//  API.m
//  My Job Pitch
//
//  Created by user on 25/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "API.h"
#import "LoginRequest.h"
#import "RegisterRequest.h"

@implementation API
{
    NSURL * apiRoot;
    AuthToken *token;
}

- (instancetype)init
{
    return [self initWithAPIRoot:@"http://mjp.digitalcrocodile.com:8000"];
}

- (id)initWithAPIRoot:(NSString*)aApiRoot
{
    self = [super init];
    if (self) {
        self->apiRoot = [NSURL URLWithString:aApiRoot];
        [self configureRestKit];
    }
    return self;
}

- (void)configureRestKit
{
    // initialize AFNetworking HTTPClient
    AFHTTPClient *client = [[AFHTTPClient alloc] initWithBaseURL:apiRoot];
    
    // initialize RestKit
    RKObjectManager *objectManager = [[RKObjectManager alloc] initWithHTTPClient:client];
    [objectManager setRequestSerializationMIMEType:RKMIMETypeJSON];
    
    [self configureMapping:objectManager
              requestClass:[LoginRequest class]
              requestArray:@[@"username", @"password"]
         requestDictionary:nil
             responseClass:[AuthToken class]
             responseArray:@[@"key"]
        responseDictionary:nil
                      path:@"/api-rest-auth/login/"
     ];
    
    [self configureMapping:objectManager
              requestClass:[RegisterRequest class]
              requestArray:@[@"username", @"password1", @"password2"]
         requestDictionary:nil
             responseClass:[User class]
             responseArray:@[@"id", @"username", @"businesses"]
        responseDictionary:@{@"job_seeker": @"jobSeeker"}
                      path:@"/api-rest-auth/registration/"
     ];
    
    
    RKObjectMapping *errorMapping = [RKObjectMapping mappingForClass: [RKErrorMessage class]];
    [errorMapping addPropertyMapping:[RKAttributeMapping attributeMappingFromKeyPath: nil
                                                                           toKeyPath: @"userInfo"]
     ];
    RKResponseDescriptor *errorResponseDescriptor =
    [RKResponseDescriptor responseDescriptorWithMapping:errorMapping
                                                 method:RKRequestMethodAny
                                            pathPattern:nil
                                                keyPath:nil
                                            statusCodes:RKStatusCodeIndexSetForClass(RKStatusCodeClassClientError)];
    [objectManager addResponseDescriptor:errorResponseDescriptor];
}

- (void)configureMapping:(RKObjectManager *)objectManager
            requestClass:(Class)requestClass
            requestArray:(NSArray *)requestArray
       requestDictionary:(NSDictionary *)requestDictionary
           responseClass:(Class)responseClass
           responseArray:(NSArray *)responseArray
      responseDictionary:(NSDictionary *)responseDictionary
                    path:(NSString *)path
{
    // setup object mappings
    RKObjectMapping *requestMapping = [RKObjectMapping requestMapping];
    if (requestArray != nil) {
        [requestMapping addAttributeMappingsFromArray:requestArray];
    }
    if (requestDictionary != nil) {
        [requestMapping addAttributeMappingsFromDictionary:requestDictionary];
    }
    
    [objectManager addRequestDescriptor: [RKRequestDescriptor
                                          requestDescriptorWithMapping:requestMapping
                                          objectClass:requestClass
                                          rootKeyPath:nil
                                          method:RKRequestMethodPOST
                                          ]];

    RKObjectMapping *responseMapping = [RKObjectMapping mappingForClass:responseClass];
    if (responseArray != nil) {
        [responseMapping addAttributeMappingsFromArray:responseArray];
    }
    if (responseDictionary != nil) {
        [responseMapping addAttributeMappingsFromDictionary:responseDictionary];
    }
    
    RKResponseDescriptor *responseDescriptor =
    [RKResponseDescriptor responseDescriptorWithMapping:responseMapping
                                                 method:RKRequestMethodPOST
                                            pathPattern:path
                                                keyPath:nil
                                            statusCodes:RKStatusCodeIndexSetForClass(RKStatusCodeClassSuccessful)];

    [objectManager addResponseDescriptor:responseDescriptor];
}

- (void)clearCookies {
    NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    NSArray *cookies = [cookieStorage cookiesForURL:apiRoot];
    for (NSHTTPCookie *cookie in cookies)
    {
        [cookieStorage deleteCookie:cookie];
    }
}

- (NSString *)getMessage:(NSError*)error
{
    NSString *localizedMessage = [error.userInfo objectForKey:NSLocalizedDescriptionKey];
    if (localizedMessage) {
        if (![localizedMessage isEqualToString: @"<null>"]) {
            return localizedMessage;
        }
    }
    return nil;
}

- (NSDictionary *)getErrors:(NSError*)error
{
    if ([error.userInfo objectForKey:RKObjectMapperErrorObjectsKey]) {
        RKErrorMessage *errorMessage = [[error.userInfo objectForKey:RKObjectMapperErrorObjectsKey] firstObject];
        return errorMessage.userInfo;
    }
    return nil;
}

- (void)loginWithUsername:(NSString*)username
                 password:(NSString*)password
                  success:(void (^)(AuthToken *authToken))success
                  failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self clearCookies];
    LoginRequest* request = [LoginRequest alloc];
    request.username = username;
    request.password = password;
    [[RKObjectManager sharedManager] postObject:request path:@"/api-rest-auth/login/" parameters:nil
                                        success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                            NSLog(@"Login success");
                                            self->token = [mappingResult firstObject];
                                            success(self->token);
                                        } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                            NSLog(@"Error logging in: %@", error);
                                            self->token = nil;
                                            failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                        }
     ];
}

- (void)registerWithUsername:(NSString*)username
                   password1:(NSString*)password1
                   password2:(NSString*)password2
                     success:(void (^)(User *user))success
                     failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;
{
    [self clearCookies];
    RegisterRequest *request = [RegisterRequest alloc];
    request.username = username;
    request.password1 = password1;
    request.password2 = password2;
    [[RKObjectManager sharedManager] postObject:request
                                           path:@"/api-rest-auth/registration/"
                                     parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                         NSLog(@"Register success");
                                         success([mappingResult firstObject]);
                                     } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                         NSLog(@"Error registering: %@", error);
                                         failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                     }
     ];
}

- (void)logout
{
    self->token = nil;
}

@end
