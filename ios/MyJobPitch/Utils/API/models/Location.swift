//
//  Location.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class Location: MJPObjectWithDates {
    
    static let mappingArray = [ "id", "business", "jobs", "name", "email", "telephone", "mobile", "longitude", "latitude", "country", "region", "city", "street", "postcode" ]
    
    static let mappingDictionary = [ "desc": "description",
                                     "emailPublic": "email_public",
                                     "mobilePublic": "mobile_public",
                                     "telephonePublic": "telephone_public",
                                     "placeName": "place_name",
                                     "placeID": "place_id",
                                     "streetNumber": "street_number"]

    var business: NSNumber!
    var jobs: NSArray!
    var name: String!
    var desc: String!
    var email: String!
    var telephone: String!
    var mobile: String!
    var emailPublic = false
    var telephonePublic = false
    var mobilePublic = false
    
    var longitude: NSNumber!
    var latitude: NSNumber!
    var placeName: String!
    var placeID: String!
    var country: String!
    var region: String!
    var city: String!
    var street: String!
    var streetNumber: String!
    var postcode: String!
    
    var images: NSArray!
    var businessData: Business!
    
    func getImage() ->Image? {
        if images != nil && images.count > 0 {
            return images.firstObject as? Image
        }
        return businessData.getImage()
    }
}
