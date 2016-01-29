//
//  Application.h
//  My Job Pitch
//
//  Created by user on 29/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "MJPObjectWithDates.h"
#import "JobSeeker.h"
#import "Job.h"

@interface ApplicationForCreation : MJPObjectWithDates
@property NSNumber *jobSeeker;
@property NSNumber *job;
@property bool shortlisted;
@property NSNumber *createdBy;
@property NSNumber *deletedBy;
@property NSNumber *status;
@end

@interface Application : MJPObjectWithDates
@property Job *job;
@property JobSeeker *jobSeeker;
@property NSArray *messages;
@property NSNumber *createdBy;
@property NSNumber *deletedBy;
@property bool shortlisted;
@property NSNumber *status;
@end
