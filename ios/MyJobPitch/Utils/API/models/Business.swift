//
//  Business.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class Business: MJPObjectWithDates {
    
    static let mappingArray = [ "id", "users", "locations", "name", "tokens", "restricted", "hr_access" ]

    var name: String!
    var users: NSArray!
    var locations: NSArray!
    var images: NSArray!
    var tokens: NSNumber!
    
    var restricted = false
    
    var hr_access = false
    
    func getImage() -> Image? {
        if images != nil && images.count > 0 {
            return images.firstObject as? Image
        }
        return nil
    }
    
}
