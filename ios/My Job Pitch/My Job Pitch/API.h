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

- (void)loginWithEmail:(NSString*)email
                 password:(NSString*)password
                  success:(void (^)(AuthToken *authToken))success
                  failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)registerWithEmail:(NSString*)email
                   password1:(NSString*)password1
                   password2:(NSString*)password2
                     success:(void (^)(AuthToken *authToken))success
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

- (void)searchJobsWithExclusions:(NSArray*)exlusions
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

- (void)updateApplicationStatus:(ApplicationStatusUpdate*)update
                        success:(void (^)(ApplicationStatusUpdate *update))success
                        failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)updateApplicationShortlist:(ApplicationShortlistUpdate*)update
                           success:(void (^)(ApplicationShortlistUpdate *update))success
                           failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)sendMessage:(MessageForCreation*)message
            success:(void (^)(MessageForCreation *message))success
            failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)savePitch:(Pitch*)pitch
          success:(void (^)(Pitch *pitch))success
          failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)getPitch:(NSNumber*)pid
         success:(void (^)(Pitch *pitch))success
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

- (void)saveJob:(Job*)job
        success:(void (^)(Job *job))success
        failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)uploadImage:(UIImage*)image
                 to:(NSString*)endpoint
          objectKey:(NSString*)objectKey
           objectId:(NSNumber*)objectId
              order:(NSNumber*)order
           progress:(void (^)(NSUInteger bytesWritten, long long totalBytesWritten, long long totalBytesExpectedToWrite))progress
            success:(void (^)(Image *image))success
            failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadBusinesses:(void (^)(NSArray *businesses))success
               failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadJobsForLocation:(NSNumber*)location
                    success:(void (^)(NSArray *applications))success
                    failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadLocationsForBusiness:(NSNumber*)business
                         success:(void (^)(NSArray *applications))success
                         failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadJobWithId:(NSNumber*)pk
              success:(void (^)(Job *job))success
              failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)searchJobSeekersForJob:(Job*)job
                    exclusions:(NSArray*)exclusions
                       success:(void (^)(NSArray *jobSeekers))success
                       failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)loadApplicationsForJob:(Job*)job
                        status:(NSNumber*)status
                   shortlisted:(BOOL)shortlisted
                       success:(void (^)(NSArray *applictions))success
                       failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)deleteBusiness:(Business*)business
               success:(void (^)(void))success
               failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)deleteLocation:(Location*)location
               success:(void (^)(void))success
               failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)deleteJob:(Job*)job
          success:(void (^)(void))success
          failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)deleteApplication:(Application*)application
                  success:(void (^)(Application *application))success
                  failure:(void (^)(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors))failure;

- (void)logout;

@end
