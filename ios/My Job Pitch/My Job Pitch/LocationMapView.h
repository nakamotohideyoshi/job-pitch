//
//  LocationMapView.h
//  My Job Pitch
//
//  Created by user on 28/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
@import GoogleMaps;

@protocol LocationMapViewDelegate

- (void)setLocationWithLatitude:(nonnull NSNumber*)latitude
                      longitude:(nonnull NSNumber*)longitude
                           name:(nonnull NSString*)name
                        placeID:(nullable NSString*)placeID;

@end

@interface LocationMapView : UIViewController<GMSMapViewDelegate, GMSAutocompleteResultsViewControllerDelegate>

@property (weak, nonatomic) IBOutlet GMSMapView *map;
@property (weak, nonatomic) IBOutlet UISearchBar *searchBar;
@property (weak, nonatomic) IBOutlet UIButton *select;
@property (nonnull) id<LocationMapViewDelegate> delegate;

- (void) setLocationWithLatitude:(nonnull NSNumber*)newLatitude
                       longitude:(nonnull NSNumber*)newLongitude
                            name:(nonnull NSString*)newName
                         placeID:(nullable NSString *)newPlaceID;
- (void) moveCameraToLocation;
- (void) moveMarkerToLocation;
- (void) moveCameraToMyLocation;

- (IBAction)select:(nullable id)sender;

@end
