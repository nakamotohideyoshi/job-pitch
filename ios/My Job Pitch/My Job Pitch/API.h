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
#import "JobSeeker.h"
#import "Job.h"
#import "Location.h"
#import "Profile.h"
#import "Application.h"
#import "Message.h"

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

- (void)loadJobSeekerWithId:(NSNumber*)pk
                    success:(void (^)(JobSeeker *jobSeeker))success
                    failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)saveJobSeeker:(JobSeeker*)jobSeeker
              success:(void (^)(JobSeeker *jobSeeker))success
              failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadJobProfileWithId:(NSNumber*)pk
                    success:(void (^)(Profile *profile))success
                    failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)saveJobProfile:(Profile*)jobSeeker
              success:(void (^)(Profile *profile))success
              failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadJobsWithExclusions:(NSArray*)exlusions
                       success:(void (^)(NSArray *jobSeekers))success
                       failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)createApplication:(ApplicationForCreation*)application
                  success:(void (^)(ApplicationForCreation *application))success
                  failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadApplications:(void (^)(NSArray *applications))success
                 failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadApplicationWithId:(NSNumber*)pk
                      success:(void (^)(Application *application))success
                      failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)sendMessage:(MessageForCreation*)message
            success:(void (^)(MessageForCreation *message))success
            failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadHours:(void (^)(NSArray *hours))success
          failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadContracts:(void (^)(NSArray *contracts))success
              failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadSexes:(void (^)(NSArray *sexes))success
          failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadNationalities:(void (^)(NSArray *nationalities))success
                  failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadSectors:(void (^)(NSArray *sectors))success
            failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadJobStatuses:(void (^)(NSArray *jobStatuses))success
                failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadApplicationStatuses:(void (^)(NSArray *applicationStatuses))success
                        failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadRoles:(void (^)(NSArray *roles))success
          failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)saveBusiness:(Business*)business
             success:(void (^)(Business *business))success
             failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)saveLocation:(Location*)location
             success:(void (^)(Location *location))success
             failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)logout;

@end
