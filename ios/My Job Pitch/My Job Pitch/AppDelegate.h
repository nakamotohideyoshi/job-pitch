//
//  AppDelegate.h
//  My Job Pitch
//
//  Created by user on 22/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "API.h"
#import "User.h"
#import "Hours.h"
#import "Contract.h"
#import "ApplicationStatus.h"

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) UIWindow *window;
@property (strong, nonatomic) API *api;
@property (strong, nonatomic) User *user;
@property (strong, nonatomic) NSArray *hours;
@property (strong, nonatomic) NSArray *contracts;
@property (strong, nonatomic) NSArray *sexes;
@property (strong, nonatomic) NSArray *nationalities;
@property (strong, nonatomic) NSArray *sectors;
@property (strong, nonatomic) NSArray *jobStatuses;
@property (strong, nonatomic) NSArray *applicationStatuses;
@property (strong, nonatomic) NSArray *roles;

- (void)loadData:(void (^)())success
         failure:(void (^)(NSDictionary *errors, NSString *message))failure;

- (void)clearData;

- (Hours*)getHours:(NSNumber*)id;
- (Hours*)getHoursByName:(NSString*)name;
- (Contract*)getContract:(NSNumber*)id;
- (Contract*)getContractByName:(NSString*)name;
- (ApplicationStatus*)getApplicationStatus:(NSNumber*)id;
- (ApplicationStatus*)getApplicationStatusByName:(NSString*)name;

@end
