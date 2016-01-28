//
//  LocationMapView.h
//  My Job Pitch
//
//  Created by user on 28/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
@import GoogleMaps;

@interface LocationMapView : UIView

@property (weak, nonatomic) IBOutlet GMSMapView *map;
@property (weak, nonatomic) IBOutlet UISearchBar *searchBar;

- (IBAction)select:(id)sender;

@end
