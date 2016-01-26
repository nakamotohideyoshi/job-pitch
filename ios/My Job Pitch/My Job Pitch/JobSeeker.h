#import <Foundation/Foundation.h>
#import "MJPObjectWithDates.h"

@interface JobSeeker : MJPObjectWithDates
@property bool active;
@property (nonnull) NSString* firstName;
@property (nonnull) NSString* lastName;
@property (nullable) NSString* email;
@property (nullable) NSString* telephone;
@property (nullable) NSString* mobile;
@property (nullable) NSNumber* age;
@property (nullable) NSNumber* sex;
@property (nullable) NSNumber* nationality;
@property bool emailPublic;
@property bool telephonePublic;
@property bool mobilePublic;
@property bool agePublic;
@property bool sexPublic;
@property bool nationalityPublic;
@property (nullable) NSNumber* profile;
@property (nullable) NSArray* pitches;
@property (nullable) NSString* desc;
@property (nullable) NSString* cv;
@end
