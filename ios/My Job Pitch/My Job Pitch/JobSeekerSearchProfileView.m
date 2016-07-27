//
//  JobSeekerSearchProfileView.m
//  My Job Pitch
//
//  Created by user on 27/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "JobSeekerSearchProfileView.h"
#import "Contract.h"
#import "Hours.h"
#import "Sector.h"

#import "MJPViewController.h"

@interface JobSeekerSearchProfileView ()

@property (nonatomic, nonnull) NSArray *contracts;
@property (nonatomic, nonnull) NSArray *hoursList;
@property (nonatomic, nonnull) NSArray *sectorList;
@property (nonatomic, nonnull) NSString *placeID;
@property (nonatomic, nonnull) NSString *placeName;
@property (nonatomic, nonnull) NSNumber *placeLatitude;
@property (nonatomic, nonnull) NSNumber *placeLongitude;

@end

@implementation JobSeekerSearchProfileView

- (instancetype)initWithCoder:(NSCoder *)aDecoder
{
    if (self = [super initWithCoder:aDecoder]) {
        
        [self xibSetup];
    }
    return self;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if (self = [super initWithFrame:frame]) {;
        [self xibSetup];
    }
    return self;
}

- (void)xibSetup
{
    UIView *view = [self loadViewFromNib];
    view.frame = self.bounds;
    view.autoresizingMask = UIViewAutoresizingFlexibleWidth|UIViewAutoresizingFlexibleHeight;
    [self addSubview:view];
    self.contractPicker = [[DownPicker alloc] initWithTextField:self.contract.textField];
    self.hoursPicker = [[DownPicker alloc] initWithTextField:self.hours.textField];
    self.sectorsPicker = [[DownPickerMultiple alloc] initWithTextField:self.sectors.textField];
    self.location.textField.enabled = false;
    self.radiusPicker = [[DownPicker alloc] initWithTextField:self.radius.textField
                                                     withData:@[@"1 miles",
                                                                @"2 miles",
                                                                @"5 miles",
                                                                @"10 miles",
                                                                @"50 miles",
                                                                ]];
    self.radius.textField.text = @"5 miles";
    
}

- (UIView*)loadViewFromNib
{
    NSBundle *bundle = [NSBundle bundleForClass:[self class]];
    UINib *nib = [UINib nibWithNibName:@"JobSeekerSearchProfileView" bundle:bundle];
    return [[nib instantiateWithOwner:self options:nil] objectAtIndex:0];
}

- (void)setContracts:(NSArray*)contractObjects
{
    _contracts = contractObjects;
    NSMutableArray *contracts = [[NSMutableArray alloc] initWithCapacity:contractObjects.count];
    [contracts addObject:@"Any"];
    for (Contract *contract in contractObjects)
        [contracts addObject: contract.name];
    [self.contractPicker setData:contracts];
    [self.contractPicker setPlaceholder:@"Contract"];
}

- (void)setHoursOptions:(NSArray*)hoursObjects
{
    _hoursList = hoursObjects;
    NSMutableArray *hoursOptions = [[NSMutableArray alloc] initWithCapacity:hoursObjects.count];
    [hoursOptions addObject:@"Any"];
    for (Hours *hours in hoursObjects)
        [hoursOptions addObject: hours.name];
    [self.hoursPicker setData:hoursOptions];
    [self.hoursPicker setPlaceholder:@"Hours"];
}

- (void)setSectorOptions:(NSArray*)sectorObjects
{
    _sectorList = sectorObjects;
    NSMutableArray *sectorOptions = [[NSMutableArray alloc] initWithCapacity:sectorObjects.count];
    for (Sector *sector in sectorObjects)
        [sectorOptions addObject: sector.name];
    [self.sectorsPicker setData:sectorOptions];
    [self.sectorsPicker setPlaceholder:@"Sectors"];
}

- (IBAction)changeLocation:(id)sender {
    LocationMapView *map = [[LocationMapView alloc] initWithNibName:@"LocationMap" bundle:nil];
    [map setDelegate:self];
    if (self.placeLatitude != nil)
        [map setLocationWithLatitude:self.placeLatitude
                           longitude:self.placeLongitude
                                name:self.placeName
                             placeID:self.placeID];
    [self.navigationController pushViewController:map animated:YES];
}

- (IBAction)continue:(id)sender {
    [self.delegate continue];
}

-(void)save:(Profile*)profile
{
    NSNumber *newContract = nil;
    for (Contract *contract in self.contracts) {
        if ([contract.name isEqualToString:self.contract.textField.text]) {
            newContract = contract.id;
            break;
        }
    }
    profile.contract = newContract;
    
    NSNumber *newHours = nil;
    for (Hours *hours in self.hoursList) {
        if ([hours.name isEqualToString:self.hours.textField.text]) {
            newHours = hours.id;
            break;
        }
    }
    profile.hours = newHours;
    
    NSArray *selectedSectors = [self.sectors.textField.text componentsSeparatedByString:@", "];
    NSMutableArray *sectors = [[NSMutableArray alloc] initWithCapacity:selectedSectors.count];
    for (Sector *sector in self.sectorList) {
        if ([selectedSectors containsObject:sector.name])
            [sectors addObject:sector.id];
    }
    profile.sectors = sectors;
    
    profile.placeID = self.placeID;
    profile.placeName = self.placeName;
    profile.latitude = self.placeLatitude;
    profile.longitude = self.placeLongitude;
    
    profile.searchRadius = [NSNumber numberWithInt:self.radius.textField.text.intValue];
}

-(void)load:(Profile*)profile
{
    NSString *newContract = nil;
    if (profile.contract) {
        for (Contract *contract in self.contracts) {
            if ([contract.id isEqual:profile.contract]) {
                newContract = contract.name;
                break;
            }
        }
    }
    if (newContract == nil)
        newContract = @"Any";
    self.contract.textField.text = newContract;
    
    NSString *newHours = nil;
    if (profile.hours) {
        for (Hours *hours in self.hoursList) {
            if ([hours.id isEqual:profile.hours]) {
                newHours = hours.name;
                break;
            }
        }
    }
    if (newHours == nil)
        newHours = @"Any";
    self.hours.textField.text = newHours;
    
    if (profile.sectors) {
        NSMutableArray *selectedSectorNames = [[NSMutableArray alloc] init];
        for (Sector *sector in self.sectorList) {
            if ([profile.sectors containsObject:sector.id]) {
                [selectedSectorNames addObject:sector.name];
            }
        }
        self.sectors.textField.text = [selectedSectorNames componentsJoinedByString:@", "];
    }

    self.placeID = profile.placeID;
    self.placeName = profile.placeName;
    self.placeLatitude = profile.latitude;
    self.placeLongitude = profile.longitude;
    [self updateLocation];
    
    if (profile.searchRadius)
        self.radius.textField.text = [NSString stringWithFormat:@"%@ miles", profile.searchRadius];
    else
        self.radius.textField.text = @"5 miles";
}

- (void)updateLocation
{
    if (self.placeName) {
        if (self.placeID == nil || [self.placeID isEqualToString:@""])
            self.location.textField.text = self.placeName;
        else
            self.location.textField.text = [NSString stringWithFormat:@"%@ (from Google)", self.placeName];
    } else {
        self.location.textField.text = @"";
    }
}

- (void)setLocationWithLatitude:(NSNumber *)latitude
                      longitude:(NSNumber *)longitude
                           name:(NSString *)name
                        placeID:(NSString *)placeID
{
    self.placeLatitude = latitude;
    self.placeLongitude = longitude;
    self.placeName = name;
    self.placeID = placeID;
    [self updateLocation];
}

- (IBAction)autoSetLocation:(id)sender {
    
    GMSPlacesClient *_placesClient = [GMSPlacesClient sharedClient];
    
    [SVProgressHUD show];
   
    [_placesClient currentPlaceWithCallback:^(GMSPlaceLikelihoodList *placeLikelihoodList, NSError *error){
        if (error == nil && placeLikelihoodList != nil) {
            GMSPlace *place = [[[placeLikelihoodList likelihoods] firstObject] place];
            if (place != nil) {
                [self setLocationWithLatitude:[NSNumber numberWithDouble:place.coordinate.latitude]
                                    longitude:[NSNumber numberWithDouble:place.coordinate.longitude]
                                         name:place.name
                                      placeID:place.placeID];
            }
        }
        
        [SVProgressHUD dismiss];
    }];
}

@end
