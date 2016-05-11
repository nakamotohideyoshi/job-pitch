//
//  CreateJobSeekerProfile.m
//  My Job Pitch
//
//  Created by user on 09/03/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "CreateJobSeekerProfile.h"
#import "CreateProfile.h"

@implementation CreateJobSeekerProfile

- (void)viewDidLoad {
    [super viewDidLoad];
    jobSeekerProfile.delegate = self;
    [jobSeekerProfile setSexes:self.appDelegate.sexes];
    [jobSeekerProfile setNationalities:self.appDelegate.nationalities];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewWillAppear:(BOOL)animated
{
    activityIndicator.hidden = YES;
}

- (NSArray *)getRequiredFields {
    return @[@"firstName", @"lastName", @"description"];
}

- (NSDictionary*)getFieldMap {
    return @{@"firstName": jobSeekerProfile.firstName.textField,
             @"lastName": jobSeekerProfile.lastName.textField,
             @"email": jobSeekerProfile.email.textField,
             @"telephone": jobSeekerProfile.telephone.textField,
             @"mobile": jobSeekerProfile.mobile.textField,
             @"age": jobSeekerProfile.age.textField,
             @"sex": jobSeekerProfile.sex.textField,
             @"nationality": jobSeekerProfile.nationality.textField,
             @"description": jobSeekerProfile.descriptionView,
             };
}

- (NSDictionary *)getErrorViewMap {
    return @{@"firstName": jobSeekerProfile.firstName.errorLabel,
             @"lastName": jobSeekerProfile.lastName.errorLabel,
             @"email": jobSeekerProfile.email.errorLabel,
             @"telephone": jobSeekerProfile.telephone.errorLabel,
             @"mobile": jobSeekerProfile.mobile.errorLabel,
             @"age": jobSeekerProfile.age.errorLabel,
             @"sex": jobSeekerProfile.sex.errorLabel,
             @"nationality": jobSeekerProfile.nationality.errorLabel,
             @"description": jobSeekerProfile.descriptionError,
             };
}

- (void)continue
{
    NSLog(@"continue");
    if ([self validate]) {
        JobSeeker *jobSeeker = [JobSeeker alloc];
        [jobSeekerProfile save:jobSeeker];
        [self showProgress:true];
        [[self appDelegate].api saveJobSeeker:jobSeeker
                                      success:^(JobSeeker *jobSeeker) {
                                          [self appDelegate].user.jobSeeker = jobSeeker.id;
                                          [self clearErrors];
                                          [self replaceWithViewControllerNamed:@"job_seeker_home"];
                                      }
                                      failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
                                          [self handleErrors:errors message:message];
                                          [self showProgress:false];
                                      }
         ];
    }
}

- (void)replaceWithViewControllerNamed:(NSString*)name
{
    UIViewController *destinationController = [self.storyboard instantiateViewControllerWithIdentifier:name];
    [self.navigationController pushViewController:destinationController animated:YES];
    NSMutableArray *navigationArray = [[NSMutableArray alloc] initWithArray: self.navigationController.viewControllers];
    for (id vc in self.navigationController.viewControllers)
        if ([vc isKindOfClass:[CreateProfile class]] || [vc isKindOfClass:[CreateJobSeekerProfile class]])
            [navigationArray removeObject:vc];
    self.navigationController.viewControllers = navigationArray;
}

@end
