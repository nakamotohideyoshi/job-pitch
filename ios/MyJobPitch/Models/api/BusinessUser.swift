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
    var user: NSNumber!
    var email: String!
    var locations: NSArray!
    var business: NSNumber!
}

class BusinessUserForCreation: MJPObject {
    var email: String!
    var locations: NSArray!
}

class BusinessUserForUpdate: MJPObject {
    var locations: NSArray!
}
