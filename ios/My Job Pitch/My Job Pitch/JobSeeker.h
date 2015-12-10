#import <Foundation/Foundation.h>
#import "MJPObject.h"

@interface JobSeeker : MJPObject
@property bool active;
@property NSString* firstName;
@property NSString* lastName;
@property (nullable) NSString* email;
@property (nullable) NSString* telephone;
@property (nullable) NSString* mobile;
@property bool email_public;
@property bool telephone_public;
@property bool mobile_public;
@property (nullable) NSNumber* age;
@property (nullable) NSNumber* sex;
@property (nullable) NSNumber* nationality;
@property bool age_public;
@property bool sex_public;
@property bool nationality_public;
@property (nullable) NSNumber* profile;
@property (nullable) NSNumber* nationality;
@property (nullable) NSString* description;
@property (nullable) NSString* cv;
@end
