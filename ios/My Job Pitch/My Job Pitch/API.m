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
    return [self initWithAPIRoot:@"https://ec2-52-31-145-95.eu-west-1.compute.amazonaws.com"];
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
             responseClass:[AuthToken class]
             responseArray:@[@"key"]
        responseDictionary:nil
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
                                          @"hasReferences": @"has_references",
                                          };
    
    NSArray* pitchArray = @[@"id",
                            @"video",
                            @"thumbnail",
                            @"job_seeker",
                            @"token",
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
    [self configureResponseMapping:objectManager
                     responseClass:[Image class]
                     responseArray:imageArray
                responseDictionary:nil
             responseRelationships:nil
                              path:@"/api/user-business-images/"
                            method:RKRequestMethodPOST];
    [self configureResponseMapping:objectManager
                     responseClass:[Image class]
                     responseArray:imageArray
                responseDictionary:nil
             responseRelationships:nil
                              path:@"/api/user-location-images/"
                            method:RKRequestMethodPOST];
    [self configureResponseMapping:objectManager
                     responseClass:[Image class]
                     responseArray:imageArray
                responseDictionary:nil
             responseRelationships:nil
                              path:@"/api/user-job-images/"
                            method:RKRequestMethodPOST];
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
    
    [self configureResponseMapping:objectManager
                     responseClass:[Business class]
                     responseArray:businessArray
                responseDictionary:nil
             responseRelationships:[self inverseRelationships:businessRelationships]
                              path:@"/api/user-businesses/"
                            method:RKRequestMethodAny
     ];
    [self configureRequestMapping:objectManager
                     requestClass:[Business class]
                     requestArray:businessArray
                requestDictionary:nil
             requestRelationships:nil
                             path:@"/api/user-businesses/"
                           method:RKRequestMethodAny
     ];
    [self configureResponseMapping:objectManager
                     responseClass:[Business class]
                     responseArray:businessArray
                responseDictionary:nil
             responseRelationships:[self inverseRelationships:businessRelationships]
                              path:@"/api/user-businesses/:pk/"
                            method:RKRequestMethodAny
     ];
    [self configureRequestMapping:objectManager
                     requestClass:[Business class]
                     requestArray:businessArray
                requestDictionary:nil
             requestRelationships:nil
                             path:@"/api/user-businesses/:pk/"
                           method:RKRequestMethodAny
     ];
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
    
    [self configureResponseMapping:objectManager
                     responseClass:[Location class]
                     responseArray:locationArray
                responseDictionary:[self inverseDictionary:locationDictionary]
             responseRelationships:[self inverseRelationships:locationRelationships]
                              path:@"/api/user-locations/"
                            method:RKRequestMethodAny
     ];
    [self configureRequestMapping:objectManager
                     requestClass:[Location class]
                     requestArray:locationArray
                requestDictionary:locationDictionary
             requestRelationships:nil
                             path:@"/api/user-locations/"
                           method:RKRequestMethodAny
     ];
    [self configureResponseMapping:objectManager
                     responseClass:[Location class]
                     responseArray:locationArray
                responseDictionary:[self inverseDictionary:locationDictionary]
             responseRelationships:[self inverseRelationships:locationRelationships]
                              path:@"/api/user-locations/:pk/"
                            method:RKRequestMethodAny
     ];
    [self configureRequestMapping:objectManager
                     requestClass:[Location class]
                     requestArray:locationArray
                requestDictionary:locationDictionary
             requestRelationships:nil
                             path:@"/api/user-locations/:pk/"
                           method:RKRequestMethodAny
     ];
    
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
    
    [self configureResponseMapping:objectManager
                     responseClass:[Job class]
                     responseArray:jobArray
                responseDictionary:[self inverseDictionary:jobDictionary]
             responseRelationships:[self inverseRelationships:jobRelationships]
                              path:@"/api/user-jobs/"
                            method:RKRequestMethodAny
     ];
    [self configureRequestMapping:objectManager
                     requestClass:[Job class]
                     requestArray:jobArray
                requestDictionary:jobDictionary
             requestRelationships:nil
                             path:@"/api/user-jobs/"
                           method:RKRequestMethodAny
     ];
    [self configureResponseMapping:objectManager
                     responseClass:[Job class]
                     responseArray:jobArray
                responseDictionary:[self inverseDictionary:jobDictionary]
             responseRelationships:[self inverseRelationships:jobRelationships]
                              path:@"/api/user-jobs/:pk/"
                            method:RKRequestMethodAny
     ];
    [self configureRequestMapping:objectManager
                     requestClass:[Job class]
                     requestArray:jobArray
                requestDictionary:jobDictionary
             requestRelationships:nil
                             path:@"/api/user-jobs/:pk/"
                           method:RKRequestMethodAny
     ];
    
    NSArray* profileArray = @[@"id",
                              @"created",
                              @"updated",
                              @"latitude",
                              @"longitude",
                              @"contract",
                              @"hours",
                              @"sectors",
                              ];
    NSDictionary* profileDictionary = @{@"searchRadius": @"search_radius",
                                        @"placeID": @"place_id",
                                        @"placeName": @"place_name",
                                        @"jobSeeker": @"job_seeker",
                                        };
    [self configureSimpleMapping:objectManager
                           class:[Profile class]
                           array:profileArray
                      dictionary:profileDictionary
                   relationships:nil
                            path:@"/api/job-profiles/"
                          method:RKRequestMethodAny
     ];
    [self configureSimpleMapping:objectManager
                           class:[Profile class]
                           array:profileArray
                      dictionary:profileDictionary
                   relationships:nil
                            path:@"/api/job-profiles/:pk/"
                          method:RKRequestMethodAny
     ];
    
    
    NSArray* applictionCreateArray = @[@"id",
                                       @"job",
                                       @"shortlisted",
                                       ];
    NSDictionary* applictionCreateDictionary = @{@"jobSeeker": @"job_seeker",
                                                 };
    [self configureSimpleMapping:objectManager
                           class:[ApplicationForCreation class]
                           array:applictionCreateArray
                      dictionary:applictionCreateDictionary
                   relationships:nil
                            path:@"/api/applications/"
                          method:RKRequestMethodPOST];
    
    NSArray* applictionArray = @[@"id",
                                 @"created",
                                 @"updated",
                                 @"shortlisted",
                                 @"status"
                                 ];
    NSDictionary* applictionDictionary = @{@"createdBy": @"created_by",
                                           @"deletedBy": @"deleted_by",
                                           };
    RKObjectMapping *jobMapping = [self
                                   createResponseMappingForClass:[Job class]
                                   array:jobArray
                                   dictionary:[self inverseDictionary:jobDictionary]
                                   relationships:[self inverseRelationships:jobRelationships]];
    RKObjectMapping *jobSeekerMapping = [self
                                         createResponseMappingForClass:[JobSeeker class]
                                         array:jobSeekerArray
                                         dictionary:[self inverseDictionary:jobSeekerDictionary]
                                         relationships:[self inverseRelationships:jobSeekerRelationships]];
    NSArray *messageArray = @[@"id",
                              @"system",
                              @"content",
                              @"read",
                              @"created",
                              @"application",
                              ];
    NSDictionary *messageDictionary = @{@"fromRole": @"from_role",
                                        };
    RKObjectMapping *messageMapping = [self
                                       createResponseMappingForClass:[Message class]
                                       array:messageArray
                                       dictionary:[self inverseDictionary:messageDictionary]
                                       relationships:nil];
    NSArray* applicationRelationships = @[@{@"source": @"job",
                                            @"destination": @"job_data",
                                            @"mapping": jobMapping,
                                            },
                                          @{@"source": @"jobSeeker",
                                            @"destination": @"job_seeker",
                                            @"mapping": jobSeekerMapping,
                                            },
                                          @{@"source": @"messages",
                                            @"destination": @"messages",
                                            @"mapping": messageMapping,
                                            },
                                          ];
    [self configureResponseMapping:objectManager
                     responseClass:[Application class]
                     responseArray:applictionArray
                responseDictionary:[self inverseDictionary:applictionDictionary]
             responseRelationships:[self inverseRelationships:applicationRelationships]
                              path:@"/api/applications/"
                            method:RKRequestMethodGET];
    
    [self configureResponseMapping:objectManager
                     responseClass:[Application class]
                     responseArray:applictionArray
                responseDictionary:[self inverseDictionary:applictionDictionary]
             responseRelationships:[self inverseRelationships:applicationRelationships]
                              path:@"/api/applications/:pk/"
                            method:RKRequestMethodGET|RKRequestMethodDELETE];
    
    NSArray *applicationStatusUpdateArray = @[@"id",
                                              @"status",
                                              ];
    
    [self configureSimpleMapping:objectManager
                           class:[ApplicationStatusUpdate class]
                           array:applicationStatusUpdateArray
                      dictionary:nil
                   relationships:nil
                            path:@"/api/applications/:pk/"
                          method:RKRequestMethodPUT];
    
    NSArray *applicationShortlistUpdateArray = @[@"id",
                                              @"shortlisted",
                                              ];
    
    [self configureSimpleMapping:objectManager
                           class:[ApplicationShortlistUpdate class]
                           array:applicationShortlistUpdateArray
                      dictionary:nil
                   relationships:nil
                            path:@"/api/applications/:pk/"
                          method:RKRequestMethodPUT];
    
    NSArray *createMessageArray = @[@"id",
                                    @"application",
                                    @"content",
                                    ];
    [self configureSimpleMapping:objectManager
                           class:[MessageForCreation class]
                           array:createMessageArray
                      dictionary:nil
                   relationships:nil
                            path:@"/api/messages/"
                          method:RKRequestMethodPOST];
    
    [self configureSimpleMapping:objectManager
                           class:[Pitch class]
                           array:pitchArray
                      dictionary:nil
                   relationships:nil
                            path:@"/api/pitches/"
                          method:RKRequestMethodPOST];
    
    [self configureSimpleMapping:objectManager
                           class:[Pitch class]
                           array:pitchArray
                      dictionary:nil
                   relationships:nil
                            path:@"/api/pitches/:pk/"
                          method:RKRequestMethodGET];
    
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
                     success:(void (^)(AuthToken *authToken))success
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

- (void)loadJobProfileWithId:(NSNumber*)pk
                    success:(void (^)(Profile *profile))success
                    failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;
{
    [self clearCookies];
    NSString *url = [NSString stringWithFormat:@"/api/job-profiles/%@/", pk];
    [[RKObjectManager sharedManager] getObjectsAtPath:url parameters:nil
                                              success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                                  success([mappingResult firstObject]);
                                              }
                                              failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                                  failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                              }];
}

- (void)saveJobProfile:(Profile*)profile
              success:(void (^)(Profile *profile))success
              failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;
{
    [self clearCookies];
    if (profile.id) {
        [[RKObjectManager sharedManager] putObject:profile
                                              path:[NSString stringWithFormat:@"/api/job-profiles/%@/", profile.id]
                                        parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                            NSLog(@"Profile updated");
                                            success([mappingResult firstObject]);
                                        } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                            NSLog(@"Error updating profile: %@", error);
                                            failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                        }
         ];
    } else {
        [[RKObjectManager sharedManager] postObject:profile
                                               path:@"/api/job-profiles/"
                                         parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                             NSLog(@"Profile created");
                                             success([mappingResult firstObject]);
                                         } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                             NSLog(@"Error creating profile: %@", error);
                                             failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                         }
         ];
    }
}

- (void)searchJobsWithExclusions:(NSArray*)exclusions
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

- (void)createApplication:(ApplicationForCreation*)application
                  success:(void (^)(ApplicationForCreation *application))success
                  failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [[RKObjectManager sharedManager] postObject:application
                                           path:@"/api/applications/"
                                     parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                         NSLog(@"Profile created");
                                         success([mappingResult firstObject]);
                                     } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                         NSLog(@"Error creating profile: %@", error);
                                         failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                     }
     ];
}

- (void)loadApplications:(void (^)(NSArray *applications))success
                 failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self loadObjectsAtPath:@"/api/applications/"
                    success:success
                    failure:failure
     ];
}

- (void)loadApplicationWithId:(NSNumber*)pk
                      success:(void (^)(Application *application))success
                      failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self clearCookies];
    NSString *url = [NSString stringWithFormat:@"/api/applications/%@/", pk];
    [[RKObjectManager sharedManager] getObjectsAtPath:url parameters:nil
                                              success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                                  success([mappingResult firstObject]);
                                              }
                                              failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                                  failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                              }];
}

- (void)updateApplicationStatus:(ApplicationStatusUpdate*)update
                        success:(void (^)(ApplicationStatusUpdate *update))success
                        failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    NSString *url = [NSString stringWithFormat:@"/api/applications/%@/", update.id];
    
    [[RKObjectManager sharedManager] putObject:update
                                          path:url
                                    parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                        NSLog(@"Application updated");
                                        success([mappingResult firstObject]);
                                    } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                        NSLog(@"Error updating application: %@", error);
                                        failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                    }
     ];
}

- (void)updateApplicationShortlist:(ApplicationShortlistUpdate*)update
                        success:(void (^)(ApplicationShortlistUpdate *update))success
                        failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    NSString *url = [NSString stringWithFormat:@"/api/applications/%@/", update.id];
    
    [[RKObjectManager sharedManager] putObject:update
                                          path:url
                                    parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                        NSLog(@"Application updated");
                                        success([mappingResult firstObject]);
                                    } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                        NSLog(@"Error updating application: %@", error);
                                        failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                    }
     ];
}

- (void)sendMessage:(MessageForCreation*)message
            success:(void (^)(MessageForCreation *message))success
            failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [[RKObjectManager sharedManager] postObject:message
                                           path:@"/api/messages/"
                                     parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                         NSLog(@"Message sent");
                                         success([mappingResult firstObject]);
                                     } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                         NSLog(@"Error sending message: %@", error);
                                         failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                     }
     ];
}


- (void)savePitch:(Pitch*)pitch
            success:(void (^)(Pitch *pitch))success
            failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self clearCookies];
    [[RKObjectManager sharedManager] postObject:pitch
                                           path:@"/api/pitches/"
                                     parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                         NSLog(@"Pitch sent");
                                         success([mappingResult firstObject]);
                                     } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                         NSLog(@"Error sending message: %@", error);
                                         failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                     }
     ];
}

- (void)getPitch:(NSNumber*)pid
         success:(void (^)(Pitch *pitch))success
         failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self clearCookies];
    NSString *url = [NSString stringWithFormat:@"/api/pitches/%d/", [pid intValue]];
    [[RKObjectManager sharedManager] getObjectsAtPath:url parameters:nil
                                              success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                                  success([mappingResult firstObject]);
                                              }
                                              failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                                  failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                              }];
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

- (void)saveBusiness:(Business*)business
              success:(void (^)(Business *business))success
              failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self clearCookies];
    if (business.id) {
        [[RKObjectManager sharedManager] putObject:business
                                              path:[NSString stringWithFormat:@"/api/user-businesses/%@/", business.id]
                                        parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                            NSLog(@"Business updated");
                                            success([mappingResult firstObject]);
                                        } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                            NSLog(@"Error updating business: %@", error);
                                            failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                        }
         ];
    } else {
        [[RKObjectManager sharedManager] postObject:business
                                               path:@"/api/user-businesses/"
                                         parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                             NSLog(@"Business created");
                                             success([mappingResult firstObject]);
                                         } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                             NSLog(@"Error creating business: %@", error);
                                             failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                         }
         ];
    }
}

- (void)saveLocation:(Location*)location
             success:(void (^)(Location *location))success
             failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self clearCookies];
    if (location.id) {
        [[RKObjectManager sharedManager] putObject:location
                                              path:[NSString stringWithFormat:@"/api/user-locations/%@/", location.id]
                                        parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                            NSLog(@"Location updated");
                                            success([mappingResult firstObject]);
                                        } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                            NSLog(@"Error updating location: %@", error);
                                            failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                        }
         ];
    } else {
        [[RKObjectManager sharedManager] postObject:location
                                               path:@"/api/user-locations/"
                                         parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                             NSLog(@"Location created");
                                             success([mappingResult firstObject]);
                                         } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                             NSLog(@"Error creating location: %@", error);
                                             failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                         }
         ];
    }
}

- (void)saveJob:(Job*)job
        success:(void (^)(Job *job))success
        failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self clearCookies];
    if (job.id) {
        [[RKObjectManager sharedManager] putObject:job
                                              path:[NSString stringWithFormat:@"/api/user-jobs/%@/", job.id]
                                        parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                            NSLog(@"Job updated");
                                            success([mappingResult firstObject]);
                                        } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                            NSLog(@"Error updating job: %@", error);
                                            failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                        }
         ];
    } else {
        [[RKObjectManager sharedManager] postObject:job
                                               path:@"/api/user-jobs/"
                                         parameters:nil success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                             NSLog(@"Job created");
                                             success([mappingResult firstObject]);
                                         } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                             NSLog(@"Error creating job: %@", error);
                                             failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                         }
         ];
    }
}

- (void)uploadImage:(UIImage*)image
                 to:(NSString*)endpoint
          objectKey:(NSString*)objectKey
           objectId:(NSNumber*)objectId
              order:(NSNumber*)order
           progress:(void (^)(NSUInteger bytesWritten, long long totalBytesWritten, long long totalBytesExpectedToWrite))progress
            success:(void (^)(Image *image))success
            failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    NSMutableURLRequest *request = [[RKObjectManager sharedManager]
                                    multipartFormRequestWithObject:nil
                                    method:RKRequestMethodPOST
                                    path:[NSString stringWithFormat:@"/api/%@/", endpoint]
                                    parameters:nil
                                    constructingBodyWithBlock:^(id<AFMultipartFormData> formData) {
                                        [formData appendPartWithFileData:UIImagePNGRepresentation(image)
                                                                    name:@"image"
                                                                fileName:@"photo.png"
                                                                mimeType:@"image/png"];
                                        [formData appendPartWithFormData:[[order stringValue] dataUsingEncoding:NSUTF8StringEncoding]
                                                                    name:@"order"];
                                        [formData appendPartWithFormData:[[objectId stringValue] dataUsingEncoding:NSUTF8StringEncoding]
                                                                    name:objectKey];
    }];
    
    RKObjectRequestOperation *operation = [[RKObjectManager sharedManager]
                                           objectRequestOperationWithRequest:request
                                           success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                               NSLog(@"Image uploaded");
                                               success([mappingResult firstObject]);
                                           } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                               NSLog(@"Error uploading image: %@", error);
                                               failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                           }];
    [operation.HTTPRequestOperation setUploadProgressBlock:progress];
    [[RKObjectManager sharedManager] enqueueObjectRequestOperation:operation];
}

- (void)loadBusinesses:(void (^)(NSArray *applications))success
               failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self loadObjectsAtPath:@"/api/user-businesses/"
                    success:success
                    failure:failure
     ];
}

- (void)loadLocationsForBusiness:(NSNumber*)business
                         success:(void (^)(NSArray *applications))success
                         failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self loadObjectsAtPath:[NSString stringWithFormat:@"/api/user-locations/?business=%@", business]
                    success:success
                    failure:failure
     ];
}

- (void)loadJobsForLocation:(NSNumber*)location
                    success:(void (^)(NSArray *applications))success
                    failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    [self loadObjectsAtPath:[NSString stringWithFormat:@"/api/user-jobs/?location=%@", location]
                    success:success
                    failure:failure
     ];
}

- (void)loadJobWithId:(NSNumber*)pk
              success:(void (^)(Job *job))success
              failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;
{
    [self clearCookies];
    NSString *url = [NSString stringWithFormat:@"/api/user-jobs/%@/", pk];
    [[RKObjectManager sharedManager] getObjectsAtPath:url parameters:nil
                                              success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                                  success([mappingResult firstObject]);
                                              }
                                              failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                                  failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                              }];
}

- (void)searchJobSeekersForJob:(Job*)job
                exclusions:(NSArray*)exclusions
                       success:(void (^)(NSArray *jobSeekers))success
                       failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    NSString *path = [NSString stringWithFormat:@"/api/job-seekers/?job=%@", job.id];
    if (exclusions)
        path = [NSString stringWithFormat:@"%@&exclude=%@", path, [exclusions componentsJoinedByString:@","]];
    
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

- (void)loadApplicationsForJob:(Job*)job
                        status:(NSNumber*)status
                   shortlisted:(BOOL)shortlisted
                       success:(void (^)(NSArray *applictions))success
                       failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    NSString *path = [NSString stringWithFormat:@"/api/applications/?job=%@&status=%@", job.id, status];
    if (shortlisted)
        path = [NSString stringWithFormat:@"%@&shortlisted=1", path];
    
    [[RKObjectManager sharedManager] getObjectsAtPath:path
                                           parameters:nil
                                              success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                                  success(mappingResult.array);
                                              } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                                  NSLog(@"Error loading applications: %@", error);
                                                  failure(operation, error, [self getMessage:error], [self getErrors:error]);
                                              }
     ];
}
- (void)deleteApplication:(Application*)application
                  success:(void (^)(Application *application))success
                  failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure
{
    NSString *url = [NSString stringWithFormat:@"/api/applications/%@/", application.id];
    [[RKObjectManager sharedManager] deleteObject:nil
                                             path:url
                                       parameters:nil
                                          success:^(RKObjectRequestOperation *operation, RKMappingResult *mappingResult) {
                                              success(mappingResult.firstObject);
                                          } failure:^(RKObjectRequestOperation *operation, NSError *error) {
                                              NSLog(@"Error deleting application: %@", error);
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
