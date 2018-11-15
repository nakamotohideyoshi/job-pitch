//
//  Profile.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class Profile: MJPObjectWithDates {
    
    static let mappingArray = [ "id", "latitude", "longitude", "contract", "hours", "sectors" ]
    
    static let mappingDictionary = [ "searchRadius": "search_radius",
                                     "placeID": "place_id",
                                     "placeName": "place_name",
                                     "postcodeLookup": "postcode_lookup",
                                     "jobseeker": "job_seeker" ]

    var jobseeker: NSNumber!
    var sectors: NSArray!
    var contract: NSNumber!
    var hours: NSNumber!
    var placeName: String!
    var placeID: String!
    var longitude: NSNumber!
    var latitude: NSNumber!
    var searchRadius: NSNumber!
    var postcodeLookup: String!
    
}
