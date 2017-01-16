//
//  User.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class User: MJPObject {

    var email: String!
    var businesses: NSArray!
    var jobSeeker: NSNumber!
    var canCreateBusinesses = true
    
    func isJobSeeker() -> Bool {
        return jobSeeker != nil
    }
    
    func isRecruiter() -> Bool {
        return businesses.count > 0
    }
}
