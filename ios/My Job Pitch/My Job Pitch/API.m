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
#import "Image.h"
#import "Hours.h"
#import "Contract.h"
#import "Sector.h"
#import "Sex.h"
#import "Nationality.h"
#import "ApplicationStatus.h"
#import "JobStatus.h"
#import "Role.h"
#import "Pitch.h"

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
      requestRelationships:nil
             responseClass:[AuthToken class]
             responseArray:@[@"key"]
        responseDictionary:nil
     responseRelationships:nil
                      path:@"/api-rest-auth/login/"
                    method:RKRequestMethodPOST
     ];
    
    [self configureMapping:objectManager
              requestClass:[RegisterRequest class]
              requestArray:@[@"username", @"password1", @"password2"]
         requestDictionary:nil
      requestRelationships:nil
             responseClass:[User class]
             responseArray:@[@"id", @"username", @"businesses"]
        responseDictionary:@{@"job_seeker": @"jobSeeker"}
     responseRelationships:nil
                      path:@"/api-rest-auth/registration/"
                    method:RKRequestMethodPOST
     ];
    
    [self configureResponseMapping:objectManager
                     responseClass:[User class]
                     responseArray:@[@"id", @"username", @"businesses"]
                responseDictionary:@{@"job_seeker": @"jobSeeker"}
             responseRelationships:nil
                              path:@"/api-rest-auth/user/"
                            method:RKRequestMethodGET
     ];
    
    NSArray* jobSeekerArray = @[@"id",
                                @"created",
                                @"updated",
                                @"email",
                                @"telephone",
                                @"mobile",
                                @"age",
                                @"sex",
                                @"nationality",
                                @"profile",
                                @"cv",
                                @"active",
                                ];
    NSDictionary* jobSeekerDictionary = @{@"firstName": @"first_name",
                                          @"lastName": @"last_name",
                                          @"desc": @"description",
                                          @"emailPublic": @"email_public",
                                          @"telephonePublic": @"telephone_public",
                                          @"mobilePublic": @"mobile_public",
                                          @"agePublic": @"age_public",
                                          @"sexPublic": @"sex_public",
                                          @"nationalityPublic": @"nationality_public",
                                          };
    
    NSArray* pitchArray = @[@"id",
                            @"video",
                            @"thumbnail",
                            ];
    RKObjectMapping *pitchMapping = [self
                                     createResponseMappingForClass:[Pitch class]
                                     array:pitchArray
                                     dictionary:nil
                                     relationships:nil];
    NSArray *jobSeekerRelationships = @[@{@"source": @"pitches",
                                          @"destination": @"pitches",
                                          @"mapping": pitchMapping,
                                          }
                                        ];
    [self configureResponseMapping:objectManager
                     responseClass:[JobSeeker class]
                     responseArray:jobSeekerArray
                responseDictionary:[self inverseDictionary:jobSeekerDictionary]
             responseRelationships:[self inverseRelationships:jobSeekerRelationships]
                              path:@"/api/job-seekers/"
                            method:RKRequestMethodAny
     ];
    [self configureRequestMapping:objectManager
                     requestClass:[JobSeeker class]
                     requestArray:jobSeekerArray
                requestDictionary:jobSeekerDictionary
             requestRelationships:nil
                             path:@"/api/job-seekers/"
                           method:RKRequestMethodAny
     ];
    [self configureResponseMapping:objectManager
                     responseClass:[JobSeeker class]
                     responseArray:jobSeekerArray
                responseDictionary:[self inverseDictionary:jobSeekerDictionary]
             responseRelationships:[self inverseRelationships:jobSeekerRelationships]
                              path:@"/api/job-seekers/:pk/"
                            method:RKRequestMethodAny
     ];
    [self configureRequestMapping:objectManager
                     requestClass:[JobSeeker class]
                     requestArray:jobSeekerArray
                requestDictionary:jobSeekerDictionary
             requestRelationships:nil
                             path:@"/api/job-seekers/:pk/"
                           method:RKRequestMethodAny
     ];
    
    NSArray* imageArray = @[@"id",
                            @"image",
                            @"thumbnail",
                            ];
    RKObjectMapping *imageMapping = [self
                                     createResponseMappingForClass:[Image class]
                                     array:imageArray
                                     dictionary:nil
                                     relationships:nil];
    
    NSArray *businessArray = @[@"id",
                               @"created",
                               @"updated",
                               @"users",
                               @"locations",
                               @"name",
                               ];
    NSArray *businessRelationships = @[@{@"source": @"images",
                                         @"destination": @"images",
                                         @"mapping": imageMapping,
                                         }
                                       ];
    RKObjectMapping *businessMapping = [self
                                        createResponseMappingForClass:[Business class]
                                        array:businessArray
                                        dictionary:nil
                                        relationships:[self inverseRelationships:businessRelationships]];
    
    NSArray *locationArray = @[@"id",
                               @"created",
                               @"updated",
                               @"business",
                               @"jobs",
                               @"name",
                               @"email",
                               @"telephone",
                               @"mobile",
                               @"longitude",
                               @"latitude",
                               @"address",
                               ];
    NSDictionary *locationDictionary = @{@"desc": @"description",
                                         @"emailPublic": @"email_public",
                                         @"mobilePublic": @"mobile_public",
                                         @"telephonePublic": @"telephone_public",
                                         @"placeName": @"place_name",
                                         @"placeID": @"place_id",
                                         };
    NSArray *locationRelationships = @[@{@"source": @"businessData",
                                         @"destination": @"business_data",
                                         @"mapping": businessMapping,
                                         },
                                       @{@"source": @"images",
                                         @"destination": @"images",
                                         @"mapping": imageMapping,
                                         }];
    RKObjectMapping *locationMapping = [self
                                        createResponseMappingForClass:[Location class]
                                        array:locationArray
                                        dictionary:[self inverseDictionary:locationDictionary]
                                        relationships:[self inverseRelationships:locationRelationships]];
    
    NSArray* jobArray = @[@"id",
                          @"created",
                          @"updated",
                          @"title",
                          @"sector",
                          @"location",
                          @"contract",
                          @"hours",
                          @"status",
                          ];
    NSDictionary* jobDictionary = @{@"desc": @"description"};
    NSArray* jobRelationships = @[@{@"source": @"locationData",
                                    @"destination": @"location_data",
                                    @"mapping": locationMapping,
                                    },
                                  @{@"source": @"images",
                                    @"destination": @"images",
                                    @"mapping": imageMapping,
                                    }
                                  ];
    [self configureResponseMapping:objectManager
                     responseClass:[Job class]
                     responseArray:jobArray
                responseDictionary:[self inverseDictionary:jobDictionary]
             responseRelationships:[self inverseRelationships:jobRelationships]
                              path:@"/api/jobs/"
                            method:RKRequestMethodGET
     ];
    
    NSArray *nameArray = @[@"id",
                           @"name",
                           ];
    NSDictionary *nameDescDictionary = @{@"desc": @"description"};
    NSDictionary *shortNameDictionary = @{@"shortName": @"short_name"};
    NSDictionary *shortNameDescDictionary = @{@"shortName": @"short_name",
                                              @"desc": @"description",
                                              };
    NSDictionary *friendlyNameDescDictionary = @{@"shortName": @"short_name",
                                              @"desc": @"description",
                                              };
    
    [self configureResponseMapping:objectManager
                     responseClass:[Hours class]
                     responseArray:nameArray
                responseDictionary:[self inverseDictionary:shortNameDescDictionary]
             responseRelationships:nil
                              path:@"/api/hours/"
                            method:RKRequestMethodGET];
    
    [self configureResponseMapping:objectManager
                     responseClass:[Contract class]
                     responseArray:nameArray
                responseDictionary:[self inverseDictionary:shortNameDescDictionary]
             responseRelationships:nil
                              path:@"/api/contracts/"
                            method:RKRequestMethodGET];
    
    [self configureResponseMapping:objectManager
                     responseClass:[Sector class]
                     responseArray:nameArray
                responseDictionary:[self inverseDictionary:nameDescDictionary]
             responseRelationships:nil
                              path:@"/api/sectors/"
                            method:RKRequestMethodGET];
    
    [self configureResponseMapping:objectManager
                     responseClass:[Sex class]
                     responseArray:nameArray
                responseDictionary:[self inverseDictionary:shortNameDescDictionary]
             responseRelationships:nil
                              path:@"/api/sexes/"
                            method:RKRequestMethodGET];
    
    [self configureResponseMapping:objectManager
                     responseClass:[Nationality class]
                     responseArray:nameArray
                responseDictionary:[self inverseDictionary:shortNameDictionary]
             responseRelationships:nil
                              path:@"/api/nationalities/"
                            method:RKRequestMethodGET];
    
    [self configureResponseMapping:objectManager
                     responseClass:[JobStatus class]
                     responseArray:nameArray
                responseDictionary:[self inverseDictionary:friendlyNameDescDictionary]
             responseRelationships:nil
                              path:@"/api/job-statuses/"
                            method:RKRequestMethodGET];
    
    [self configureResponseMapping:objectManager
                     responseClass:[ApplicationStatus class]
                     responseArray:nameArray
                responseDictionary:[self inverseDictionary:friendlyNameDescDictionary]
             responseRelationships:nil
                              path:@"/api/application-statuses/"
                            method:RKRequestMethodGET];
    
    [self configureResponseMapping:objectManager
                     responseClass:[Role class]
                     responseArray:nameArray
                responseDictionary:nil
             responseRelationships:nil
                              path:@"/api/roles/"
                            method:RKRequestMethodGET];
    
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

- (NSDictionary*)inverseDictionary:(NSDictionary*)dictionary
{
    NSArray * keys = [dictionary allKeys];
    NSArray * vals = [dictionary objectsForKeys:keys notFoundMarker:@""];
    return [NSDictionary dictionaryWithObjects:keys forKeys:vals];
}

- (NSArray*)inverseRelationships:(NSArray*)relationships
{
    NSMutableArray *result = [[NSMutableArray alloc] initWithCapacity:[relationships count]];
    for (NSDictionary *relationship in relationships) {
        [result addObject:@{@"source": [relationship objectForKey:@"destination"],
                            @"destination": [relationship objectForKey:@"source"],
                            @"mapping": [relationship objectForKey:@"mapping"],
                            }
         ];
    }
    return result;
}

- (void)configureMapping:(RKObjectManager *)objectManager
            requestClass:(Class)requestClass
            requestArray:(NSArray *)requestArray
       requestDictionary:(NSDictionary *)requestDictionary
    requestRelationships:(NSArray*)requestRelationships
           responseClass:(Class)responseClass
           responseArray:(NSArray *)responseArray
      responseDictionary:(NSDictionary *)responseDictionary
   responseRelationships:(NSArray*)responseRelationships
                    path:(NSString *)path
                  method:(RKRequestMethod)method
{
    [self configureRequestMapping:objectManager
                     requestClass:requestClass
                     requestArray:requestArray
                requestDictionary:requestDictionary
             requestRelationships:requestRelationships
                             path:path
                           method:method
     ];
    
    [self configureResponseMapping:objectManager
                     responseClass:responseClass
                     responseArray:responseArray
                responseDictionary:responseDictionary
             responseRelationships:responseRelationships
                              path:path
                            method:method
     ];
}

- (void)configureSimpleMapping:(RKObjectManager *)objectManager
                         class:(Class)class
                         array:(NSArray *)array
                    dictionary:(NSDictionary *)dictionary
                 relationships:(NSArray*)relationships
                          path:(NSString *)path
                        method:(RKRequestMethod)method
{
    [self configureRequestMapping:objectManager
                     requestClass:class
                     requestArray:array
                requestDictionary:dictionary
             requestRelationships:relationships
                             path:path
                           method:method
     ];
    
    [self configureResponseMapping:objectManager
                     responseClass:class
                     responseArray:array
                responseDictionary:[self inverseDictionary:dictionary]
             responseRelationships:[self inverseRelationships:relationships]
                              path:path
                            method:method
     ];
}


- (void)setupMapping:(RKObjectMapping*)mapping
               array:(NSArray *)array
          dictionary:(NSDictionary *)dictionary
       relationships:(NSArray*)relationships
{
    if (array != nil) {
        [mapping addAttributeMappingsFromArray:array];
    }
    if (dictionary != nil) {
        [mapping addAttributeMappingsFromDictionary:dictionary];
    }
    if (relationships != nil) {
        for (NSDictionary *relationship in relationships) {
            [mapping addPropertyMapping:[RKRelationshipMapping
                                         relationshipMappingFromKeyPath:[relationship
                                                                         objectForKey:@"source"]
                                         toKeyPath:[relationship objectForKey:@"destination"]
                                         withMapping:[relationship objectForKey:@"mapping"]
                                         ]];
        }
    }
}

- (void)configureRequestMapping:(RKObjectManager *)objectManager
                   requestClass:(Class)requestClass
                   requestArray:(NSArray *)requestArray
              requestDictionary:(NSDictionary *)requestDictionary
           requestRelationships:(NSArray*)requestRelationships
                           path:(NSString *)path
                         method:(RKRequestMethod)method
{
    RKObjectMapping *requestMapping = [RKObjectMapping requestMapping];
    [self setupMapping:requestMapping
                 array:requestArray
            dictionary:requestDictionary
         relationships:requestRelationships
     ];
    [objectManager addRequestDescriptor: [RKRequestDescriptor
                                          requestDescriptorWithMapping:requestMapping
                                          objectClass:requestClass
                                          rootKeyPath:nil
                                          method:RKRequestMethodPOST|RKRequestMethodPUT
                                          ]];
}

- (RKObjectMapping*)createResponseMappingForClass:(Class)class
                                            array:(NSArray *)array
                                       dictionary:(NSDictionary *)dictionary
                                    relationships:(NSArray*)relationships
{
    
    RKObjectMapping *mapping = [RKObjectMapping mappingForClass:class];
    [self setupMapping:mapping
                 array:array
            dictionary:dictionary
         relationships:relationships
     ];
    return mapping;
}

- (void)configureResponseMapping:(RKObjectManager *)objectManager
                   responseClass:(Class)responseClass
                   responseArray:(NSArray *)responseArray
              responseDictionary:(NSDictionary *)responseDictionary
           responseRelationships:(NSArray*)responseRelationships
                            path:(NSString *)path
                          method:(RKRequestMethod)method
{
    RKObjectMapping *responseMapping = [self createResponseMappingForClass:responseClass
                                                                     array:responseArray
                                                                dictionary:responseDictionary
                                                             relationships:responseRelationships
                                        ];
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
- (void)loadJobSeekerWithId:(NSNumber*)pk
                    success:(void (^)(JobSeeker *jobSeeker))success
                    failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;
{
    [self clearCookies];
    NSString *url = [NSString stringWithFormat:@"/api/job-seekers/%@/", pk];
    [[RKObjectManager sharedManager] getObjectsAtPath:url parameters:nil
                                              success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                                  success([mappingResult firstObject]);
                                              }
                                              failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                                  failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                              }];
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
                                             NSLog(@"JobSeeker updated");
                                             success([mappingResult firstObject]);
                                         } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                             NSLog(@"Error updating jobseeker: %@", error);
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

- (void)loadJobsWithExclusions:(NSArray*)exclusions
                       success:(void (^)(NSArray *jobSeekers))success
                       failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    NSString *path = @"/api/jobs/";
    if (exclusions)
        path = [NSString stringWithFormat:@"%@?exclude=%@", path, [exclusions componentsJoinedByString:@","]];
    
    [[RKObjectManager sharedManager] getObjectsAtPath:path
                                           parameters:nil
                                              success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                                  success(mappingResult.array);
                                              } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                                  NSLog(@"Error loading jobs: %@", error);
                                                  failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                              }
     ];
}

- (void)loadHours:(void (^)(NSArray *hours))success
          failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self loadObjectsAtPath:@"/api/hours/"
                    success:success
                    failure:failure
     ];
}

- (void)loadContracts:(void (^)(NSArray *contracts))success
              failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self loadObjectsAtPath:@"/api/contracts/"
                    success:success
                    failure:failure
     ];
}

- (void)loadSexes:(void (^)(NSArray *sexes))success
          failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    
    [self loadObjectsAtPath:@"/api/sexes/"
                    success:success
                    failure:failure
     ];
}

- (void)loadNationalities:(void (^)(NSArray *nationalities))success
                  failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self loadObjectsAtPath:@"/api/nationalities/"
                    success:success
                    failure:failure
     ];
}

- (void)loadSectors:(void (^)(NSArray *sectors))success
                  failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self loadObjectsAtPath:@"/api/sectors/"
                    success:success
                    failure:failure
     ];
}

- (void)loadJobStatuses:(void (^)(NSArray *jobStatuses))success
                failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self loadObjectsAtPath:@"/api/job-statuses/"
                    success:success
                    failure:failure
     ];
}

- (void)loadApplicationStatuses:(void (^)(NSArray *applicationStatuses))success
                failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self loadObjectsAtPath:@"/api/application-statuses/"
                    success:success
                    failure:failure
     ];
}

- (void)loadRoles:(void (^)(NSArray *roles))success
                failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self loadObjectsAtPath:@"/api/roles/"
                    success:success
                    failure:failure
     ];
}

- (void)loadObjectsAtPath:(NSString*)path
                  success:(void (^)(NSArray *objects))success
                  failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [[RKObjectManager sharedManager] getObjectsAtPath:path
                                           parameters:nil
                                              success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                                  success(mappingResult.array);
                                              } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                                  NSLog(@"Error loading objects: %@", error);
                                                  failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                              }
     ];
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
