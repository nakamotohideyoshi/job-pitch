//
//  LocationMapView.m
//  My Job Pitch
//
//  Created by user on 28/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "LocationMapView.h"

@implementation LocationMapView {
    NSNumber *latitude;
    NSNumber *longitude;
    NSString *name;
    NSString *placeID;
    
    BOOL moveToMyLocation;
    CLLocationCoordinate2D myLocation;
    
    GMSMarker *marker;
    GMSAutocompleteResultsViewController *resultsViewController;
    UISearchController *searchController;
}

- (void)viewDidLoad
{
    if ([self respondsToSelector:@selector(edgesForExtendedLayout)])
        self.edgesForExtendedLayout = UIRectEdgeNone;
    
    [self.map setDelegate:self];
    [self.map setPadding:UIEdgeInsetsMake(0, 0, 40, 0)];
    [self.map setMyLocationEnabled:true];
    [self.map.settings setMyLocationButton:true];
    
    [self.map addObserver:self
               forKeyPath:@"myLocation"
                  options:NSKeyValueObservingOptionNew
                  context:NULL];
    myLocation = CLLocationCoordinate2DMake(-1, -1);
    
    marker = [[GMSMarker alloc] init];
    marker.map = self.map;
    
    if (latitude == nil)
        moveToMyLocation = true;
    else {
        [self moveMarkerToLocation:@"This is your currently selected location"];
        [self moveCameraToLocation];
    }

    resultsViewController = [[GMSAutocompleteResultsViewController alloc] init];
    resultsViewController.delegate = self;
    
    searchController = [[UISearchController alloc]
                        initWithSearchResultsController:resultsViewController];
    searchController.searchResultsUpdater = resultsViewController;
    self.navigationItem.titleView = searchController.searchBar;
    self.definesPresentationContext = YES;
    searchController.hidesNavigationBarDuringPresentation = NO;
    
    [MyAlertController title:nil message:@"Search for a location, or long-press on the map to manually select a location."
                          ok:@"Got it!"
                  okCallback:nil cancel:nil cancelCallback:nil];
    
}

// Handle the user's selection.
- (void)resultsController:(GMSAutocompleteResultsViewController *)resultsController
 didAutocompleteWithPlace:(GMSPlace *)place {
    searchController.active = NO;
    latitude = [NSNumber numberWithDouble:place.coordinate.latitude];
    longitude = [NSNumber numberWithDouble:place.coordinate.longitude];
    name = place.name;
    placeID = place.placeID;
    [self moveMarkerToLocation:nil];
    [self moveCameraToLocation];
}

- (void)resultsController:(GMSAutocompleteResultsViewController *)resultsController
 didFailAutocompleteWithError:(NSError *)error {
    [self dismissViewControllerAnimated:YES completion:nil];
    // TODO: handle the error.
    NSLog(@"Error: %@", [error description]);
}

- (void) setLocationWithLatitude:(NSNumber*)newLatitude
                       longitude:(NSNumber*)newLongitude
                            name:(NSString*)newName
                         placeID:(nullable NSString *)newPlaceID
{
    latitude = newLatitude;
    longitude = newLongitude;
    name = newName;
    placeID = newPlaceID;
}

- (void) moveCameraToLocation
{
    [self.map setCamera:[GMSCameraPosition cameraWithLatitude:[latitude doubleValue]
                                                    longitude:[longitude doubleValue]
                                                         zoom:14]];
}

- (void)moveMarkerToLocation:(NSString *)snippet
{
    marker.title = name;
    marker.snippet = snippet;
    marker.position = CLLocationCoordinate2DMake([latitude doubleValue], [longitude doubleValue]);
    [self.map setSelectedMarker:marker];
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary *)change
                       context:(void *)context {
    
    CLLocation *location = [change objectForKey:NSKeyValueChangeNewKey];
    myLocation = location.coordinate;
    
    if (moveToMyLocation) {
        [self didTapMyLocationButtonForMapView:self.map];
    }
}

- (void)mapView:(GMSMapView *)mapView didLongPressAtCoordinate:(CLLocationCoordinate2D)coordinate
{
    [self setLocationWithLatitude:[NSNumber numberWithDouble:coordinate.latitude]
                        longitude:[NSNumber numberWithDouble:coordinate.longitude]
                             name:@"Custom Location"
                          placeID:@""
     ];
    [self moveMarkerToLocation:nil];
}


- (BOOL)didTapMyLocationButtonForMapView:(GMSMapView *)mapView {
    
    if (myLocation.latitude != -1) {
        [self setLocationWithLatitude:[NSNumber numberWithDouble:myLocation.latitude]
                            longitude:[NSNumber numberWithDouble:myLocation.longitude]
                                 name:@"Custom Location"
                              placeID:@""
        ];
        [self moveMarkerToLocation:@"This is your currently location"];
        [self moveCameraToLocation];
        moveToMyLocation = false;
    } else {
        moveToMyLocation = true;
    }
    
    return YES;
}

- (IBAction)select:(id)sender {
    [self.delegate setLocationWithLatitude:latitude
                                 longitude:longitude
                                      name:name
                                   placeID:placeID];
    [self.navigationController popViewControllerAnimated:true];
}

- (void)dealloc
{
    [self.map removeObserver:self forKeyPath:@"myLocation"];
}

@end
