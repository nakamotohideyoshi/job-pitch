//
//  User.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class User: MJPObject {
    
    static let mappingArray = [ "id", "email", "businesses", "employees" ]
    static let mappingDictionary = [ "jobseeker":           "job_seeker",
                                     "canCreateBusinesses": "can_create_businesses" ]

    var email: String!
    var businesses: NSArray!
    var employees: NSArray!
    var jobseeker: NSNumber!
    var canCreateBusinesses = true
    
    func isJobseeker() -> Bool {
        return jobseeker != nil
    }
    
    func isRecruiter() -> Bool {
        return businesses.count > 0
    }
}
