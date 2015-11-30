//
//  My_Job_PitchTests.m
//  My Job PitchTests
//
//  Created by user on 22/11/2015.
//  Copyright © 2015 SC Labs Ltd. All rights reserved.
//

#import <XCTest/XCTest.h>
#import "API.h"
#import "AuthToken.h"

@interface My_Job_PitchTests : XCTestCase
@end

@implementation My_Job_PitchTests

    NSString* apiRoot = @"http://mjp.digitalcrocodile.com:8000";

- (void)setUp {
    [super setUp];
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
    [super tearDown];
}

- (void)testLogin {
    // This is an example of a functional test case.
    // Use XCTAssert and related functions to verify your tests produce the correct results.
    XCTestExpectation *expectation = [self expectationWithDescription:@"asynchronous request"];
    
    API* api = [[API alloc] initWithAPIRoot:apiRoot];
    [api loginWithUsername:@"r1" password:@"admin1"
                   success:^(AuthToken * token) {
                       XCTAssertNotNil(token.key);
                       [expectation fulfill];
                   }
                   failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                       NSLog(@"error");
                       XCTAssert(FALSE);
                       [expectation fulfill];
                   }];
    [self waitForExpectationsWithTimeout:10.0 handler:nil];
}

- (void)testLoginFailure {
    // This is an example of a functional test case.
    // Use XCTAssert and related functions to verify your tests produce the correct results.
    XCTestExpectation *expectation = [self expectationWithDescription:@"asynchronous request"];
    
    API* api = [[API alloc] initWithAPIRoot:apiRoot];
    [api loginWithUsername:@"r1" password:@"admin1x"
                   success:^(AuthToken * token) {
                       XCTAssert(FALSE);
                       [expectation fulfill];
                   }
                   failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                       XCTAssertEqualObjects([[errors objectForKey:@"non_field_errors"] firstObject], @"Unable to log in with provided credentials.");
                       [expectation fulfill];
                   }];
    [self waitForExpectationsWithTimeout:10.0 handler:nil];
}

- (void)testRegistrationFailure {
    XCTestExpectation *expectation = [self expectationWithDescription:@"asynchronous request"];
    
    API* api = [[API alloc] initWithAPIRoot:apiRoot];
    [api registerWithUsername:@"r1" password1:@"admin1" password2:@"admin1"
                      success:^(User *user) {
                          XCTAssert(FALSE);
                          [expectation fulfill];
                      }
                      failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                          NSString *userError = [[errors valueForKey:@"username"] firstObject];
                          XCTAssertEqualObjects(userError, @"This username is already taken. Please choose another.");
                          [expectation fulfill];
                      }];
    
    [self waitForExpectationsWithTimeout:10.0 handler:nil];
}

- (void)testRegistrationSuccess
{
    XCTestExpectation *expectation = [self expectationWithDescription:@"asynchronous request"];
    
    API* api = [[API alloc] initWithAPIRoot:apiRoot];
    NSString *username = [NSString stringWithFormat:@"_ios_test_%u", arc4random() % 10000];
    [api registerWithUsername:username
                    password1:@"admin1" password2:@"admin1"
                      success:^(User *user) {
                          XCTAssertEqualObjects(user.username, username);
                          [expectation fulfill];
                      }
                      failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                          XCTAssert(FALSE);
                          [expectation fulfill];
                      }];
    
    [self waitForExpectationsWithTimeout:10000.0 handler:nil];
}

@end
