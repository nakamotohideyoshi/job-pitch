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
                    method:RKRequestMethodPOST
     ];
    
    [self configureMapping:objectManager
              requestClass:[RegisterRequest class]
              requestArray:@[@"username", @"password1", @"password2"]
         requestDictionary:nil
             responseClass:[User class]
             responseArray:@[@"id", @"username", @"businesses"]
        responseDictionary:@{@"job_seeker": @"jobSeeker"}
                      path:@"/api-rest-auth/registration/"
                    method:RKRequestMethodPOST
     ];
    
    [self configureResponseMapping:objectManager
                     responseClass:[User class]
                     responseArray:@[@"id", @"username", @"businesses"]
                responseDictionary:@{@"job_seeker": @"jobSeeker"}
                              path:@"/api-rest-auth/user/"
                            method:RKRequestMethodGET
     ];
    
    [self configureSimpleMapping:objectManager
                           class:[JobSeeker class]
                           array:@[@"id",
                                   @"firstName",
                                   @"lastName",
                                   @"email",
                                   @"telephone",
                                   @"mobile",
                                   @"age",
                                   @"sex",
                                   @"nationality",
                                   @"profile",
                                   @"cv"
                                   ]
                      dictionary:@{@"desc": @"description",
                                   @"emailPublic": @"email_public",
                                   @"telephonePublic": @"telephone_public",
                                   @"mobilePublic": @"mobile_public",
                                   @"agePublic": @"age_public",
                                   @"sexPublic": @"sex_public",
                                   @"nationalityPublic": @"nationality_public",
                                   }
                            path:@"/api/job-seekers/"
                          method:RKRequestMethodAny
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
                  method:(RKRequestMethod)method
{
    [self configureRequestMapping:objectManager
                     requestClass:requestClass
                     requestArray:requestArray
                requestDictionary:requestDictionary
                             path:path
                           method:method
     ];
    
    [self configureResponseMapping:objectManager
                     responseClass:responseClass
                     responseArray:responseArray
                responseDictionary:responseDictionary
                              path:path
                            method:method
     ];
}

- (void)configureSimpleMapping:(RKObjectManager *)objectManager
                         class:(Class)class
                         array:(NSArray *)array
                    dictionary:(NSDictionary *)dictionary
                    path:(NSString *)path
                  method:(RKRequestMethod)method
{
    [self configureRequestMapping:objectManager
                     requestClass:class
                     requestArray:array
                requestDictionary:dictionary
                             path:path
                           method:method
     ];
    
    [self configureResponseMapping:objectManager
                     responseClass:class
                     responseArray:array
                responseDictionary:dictionary
                              path:path
                            method:method
     ];
}

- (void)configureRequestMapping:(RKObjectManager *)objectManager
                   requestClass:(Class)requestClass
                   requestArray:(NSArray *)requestArray
              requestDictionary:(NSDictionary *)requestDictionary
                           path:(NSString *)path
                         method:(RKRequestMethod)method
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
}

- (void)configureResponseMapping:(RKObjectManager *)objectManager
                   responseClass:(Class)responseClass
                   responseArray:(NSArray *)responseArray
              responseDictionary:(NSDictionary *)responseDictionary
                            path:(NSString *)path
                          method:(RKRequestMethod)method
{
    RKObjectMapping *responseMapping = [RKObjectMapping mappingForClass:responseClass];
    if (responseArray != nil) {
        [responseMapping addAttributeMappingsFromArray:responseArray];
    }
    if (responseDictionary != nil) {
        [responseMapping addAttributeMappingsFromDictionary:responseDictionary];
    }
    
    RKResponseDescriptor *responseDescriptor =
    [RKResponseDescriptor responseDescriptorWithMapping:responseMapping
                                                 method:method
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
                                            AuthToken *token = [mappingResult firstObject];
                                            [self setToken:token];
                                            success(token);
                                        } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                            NSLog(@"Error logging in: %@", error);
                                            [self clearToken];
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

- (void)getUser:(void (^)(User *user))success
        failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;
{
    [self clearCookies];
    [[RKObjectManager sharedManager] getObjectsAtPath:@"/api-rest-auth/user/" parameters:nil
                                       success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                           success([mappingResult firstObject]);
                                       } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                           failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                       }
     ];
}

- (void)saveJobSeeker:(JobSeeker*)jobSeeker
              success:(void (^)(JobSeeker *jobSeeker))success
              failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;
{
    [self clearCookies];
    if (jobSeeker.id) {
        [[RKObjectManager sharedManager] putObject:jobSeeker
                                              path:[NSString stringWithFormat:@"/api/job-seekers/%@/", jobSeeker.id]
                                         parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                             NSLog(@"JobSeeker created");
                                             success([mappingResult firstObject]);
                                         } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                             NSLog(@"Error creating jobseeker: %@", error);
                                             failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                         }
         ];
    } else {
        [[RKObjectManager sharedManager] postObject:jobSeeker
                                               path:@"/api/job-seekers/"
                                         parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                             NSLog(@"JobSeeker created");
                                             success([mappingResult firstObject]);
                                         } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                             NSLog(@"Error creating jobseeker: %@", error);
                                             failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                         }
         ];
    }
}

- (void)logout
{
    [self clearToken];
}

- (void)setToken:(AuthToken*)token
{
    [[RKObjectManager sharedManager].HTTPClient
     setDefaultHeader:@"Authorization" value:[NSString stringWithFormat: @"Token %@", token.key]];
}

- (void)clearToken
{
    [[RKObjectManager sharedManager].HTTPClient clearAuthorizationHeader];
}

@end
