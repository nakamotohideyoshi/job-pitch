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
    GMSMarker *marker;
    GMSAutocompleteResultsViewController *resultsViewController;
    UISearchController *searchController;
}

- (void)viewDidLoad
{
    if ([self respondsToSelector:@selector(edgesForExtendedLayout)])
        self.edgesForExtendedLayout = UIRectEdgeNone;
    
    self.select.enabled = false;
    
    [self.map setDelegate:self];
    [self.map setPadding:UIEdgeInsetsMake(0, 0, 40, 0)];
    [self.map setMyLocationEnabled:true];
//    [self.map.settings setMyLocationButton:true];
    [self.map addObserver:self
               forKeyPath:@"myLocation"
                  options:NSKeyValueObservingOptionNew
                  context:NULL];
    if (latitude == nil)
        [self moveCameraToMyLocation];
    else {
        [self moveMarkerToLocation];
        [self moveCameraToLocation];
        marker.snippet = @"This is your currently selected search location";
        [self.map setSelectedMarker:marker];
    }

    resultsViewController = [[GMSAutocompleteResultsViewController alloc] init];
    resultsViewController.delegate = self;
    
    searchController = [[UISearchController alloc]
                        initWithSearchResultsController:resultsViewController];
    searchController.searchResultsUpdater = resultsViewController;
    self.navigationItem.titleView = searchController.searchBar;
    self.definesPresentationContext = YES;
    searchController.hidesNavigationBarDuringPresentation = NO;
    
    [[[UIAlertView alloc] initWithTitle:nil
                                message:@"Search for a location, or long-press on the map to manually select a location."
                               delegate:nil
                      cancelButtonTitle:@"Got it!"
                      otherButtonTitles:nil] show];
}


// Handle the user's selection.
- (void)resultsController:(GMSAutocompleteResultsViewController *)resultsController
 didAutocompleteWithPlace:(GMSPlace *)place {
    searchController.active = NO;
    latitude = [NSNumber numberWithDouble:place.coordinate.latitude];
    longitude = [NSNumber numberWithDouble:place.coordinate.longitude];
    name = place.name;
    placeID = place.placeID;
    [self moveMarkerToLocation];
    [self moveCameraToLocation];
    [self.map setSelectedMarker:marker];
    [self.select setEnabled:true];
    [self.select setAlpha:1.0];
}

- (void)resultsController:(GMSAutocompleteResultsViewController *)resultsController
 didFailAutocompleteWithError:(NSError *)error {
    [self dismissViewControllerAnimated:YES completion:nil];
    // TODO: handle the error.
    NSLog(@"Error: %@", [error description]);
}

- (IBAction)select:(id)sender {
    [self.delegate setLocationWithLatitude:latitude
                                 longitude:longitude
                                      name:name
                                   placeID:placeID];
    [self.navigationController popViewControllerAnimated:true];
}

- (void) moveCameraToMyLocation
{
    moveToMyLocation = true;
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

- (void)moveMarkerToLocation
{
    if (marker == nil) {
        marker = [[GMSMarker alloc] init];
        marker.map = self.map;
    }
    marker.title = name;
    marker.snippet = nil;
    marker.position = CLLocationCoordinate2DMake([latitude doubleValue], [longitude doubleValue]);
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary *)change
                       context:(void *)context {
    if (moveToMyLocation) {
        CLLocation *location = [change objectForKey:NSKeyValueChangeNewKey];
        [self.map setCamera:[GMSCameraPosition cameraWithTarget:location.coordinate zoom:14]];
        moveToMyLocation = false;
    }
}


- (void)mapView:(GMSMapView *)mapView didLongPressAtCoordinate:(CLLocationCoordinate2D)coordinate
{
    [self setLocationWithLatitude:[NSNumber numberWithDouble:coordinate.latitude]
                        longitude:[NSNumber numberWithDouble:coordinate.longitude]
                             name:@"Custom location"
                          placeID:@""
     ];
    [self moveMarkerToLocation];
    [self.select setEnabled:true];
    [self.select setAlpha:1.0];
}

- (void)dealloc
{
    [self.map removeObserver:self forKeyPath:@"myLocation"];
}

@end
