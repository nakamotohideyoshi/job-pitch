//
//  BusinessUser.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/21/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import Foundation
import UIKit

class BusinessUser: MJPObject {
    static let mappingArray = [ "id", "user", "email", "locations", "business"]
    
    var user: NSNumber!
    var email: String!
    var locations: NSArray!
    var business: NSNumber!
}

class BusinessUserForCreation: MJPObject {
    static let mappingArray = [ "email", "locations" ]
    
    var email: String!
    var locations: NSArray!
}

class BusinessUserForUpdate: MJPObject {
    static let mappingArray = [ "locations" ]
    
    var locations: NSArray!
}
