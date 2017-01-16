//
//  Location.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class Location: MJPObjectWithDates {

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
    var placeName: String!
    var placeID: String!
    var longitude: NSNumber!
    var latitude: NSNumber!
    var address: String!
    var images: NSArray!
    var businessData: Business!
    
    func getImage() ->Image? {
        if images != nil && images.count > 0 {
            return images.firstObject as? Image
        }
        return businessData.getImage()
    }
}
