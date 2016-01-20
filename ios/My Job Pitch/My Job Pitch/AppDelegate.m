//
//  AppDelegate.m
//  My Job Pitch
//
//  Created by user on 22/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import "AppDelegate.h"
#import "API.h"
#import "Hours.h"
#import "Contract.h"
#import "Sector.h"
#import "Sex.h"
#import "Nationality.h"
#import "ApplicationStatus.h"
#import "JobStatus.h"
#import "Role.h"

@interface AppDelegate ()
@property Boolean loaded;
@end

@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    _api = [[API alloc] init];
    self.loaded = false;
    return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
}

- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}

- (void)loadData:(void (^)())success
         failure:(void (^)(NSDictionary *errors, NSString *message))failure
{
    [self.api loadHours:^(NSArray *hours) {
        @synchronized(self) {
            self.hours = hours;
            if ([self isLoaded]) success();
        }
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        failure(errors, message);
    }];
    
    [self.api loadContracts:^(NSArray *contracts) {
        @synchronized(self) {
            self.contracts = contracts;
            if ([self isLoaded]) success();
        }
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        failure(errors, message);
    }];
    
    [self.api loadSexes:^(NSArray *sexes) {
        @synchronized(self) {
            self.sexes = sexes;
            if ([self isLoaded]) success();
        }
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        failure(errors, message);
    }];
    
    [self.api loadNationalities:^(NSArray *nationalities) {
        @synchronized(self) {
            self.nationalities = nationalities;
            if ([self isLoaded]) success();
        }
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        failure(errors, message);
    }];
    
    [self.api loadSectors:^(NSArray *sectors) {
        @synchronized(self) {
            self.sectors = sectors;
            if ([self isLoaded]) success();
        }
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        failure(errors, message);
    }];
    
    
    [self.api loadJobStatuses:^(NSArray *jobStatuses) {
        @synchronized(self) {
            self.jobStatuses = jobStatuses;
            if ([self isLoaded]) success();
        }
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        failure(errors, message);
    }];
    
    [self.api loadApplicationStatuses:^(NSArray *applicationStatuses) {
        @synchronized(self) {
            self.applicationStatuses = applicationStatuses;
            if ([self isLoaded]) success();
        }
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        failure(errors, message);
    }];
    
    [self.api loadRoles:^(NSArray *roles) {
        @synchronized(self) {
            self.roles = roles;
            if ([self isLoaded]) success();
        }
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        failure(errors, message);
    }];
}

- (void)clearData
{
    self.user = nil;
    self.hours = nil;
    self.contracts = nil;
    self.sexes = nil;
    self.nationalities = nil;
    self.sectors = nil;
    self.jobStatuses = nil;
    self.applicationStatuses = nil;
    self.roles = nil;
}

- (Boolean)isLoaded
{
    self.loaded =
        self.user != nil &&
        self.hours != nil &&
        self.contracts != nil &&
        self.sexes != nil &&
        self.nationalities != nil &&
        self.sectors != nil &&
        self.jobStatuses != nil &&
        self.applicationStatuses != nil &&
        self.roles != nil;
    return self.loaded;
}

- (Hours*)getHours:(NSNumber*)id
{
    for (Hours *hours in self.hours)
        if (hours.id == id)
            return hours;
    return nil;
}

- (Hours*)getHoursByName:(NSString*)name
{
    for (Hours *hours in self.hours)
        if (hours.name == name)
            return hours;
    return nil;
}

- (Contract*)getContract:(NSNumber*)id
{
    for (Contract *contract in self.contracts)
        if (contract.id == id)
            return contract;
    return nil;
}

- (Contract*)getContractByName:(NSString*)name;
{
    for (Contract *contract in self.contracts)
        if (contract.name == name)
            return contract;
    return nil;
}

@end
