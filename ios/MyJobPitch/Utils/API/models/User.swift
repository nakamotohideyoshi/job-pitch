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
    static let mappingDictionary = [ "jobSeeker":           "job_seeker",
                                     "canCreateBusinesses": "can_create_businesses" ]

    var email: String!
    var businesses: NSArray!
    var employees: NSArray!
    var jobSeeker: NSNumber!
    var canCreateBusinesses = true
    
    func isJobSeeker() -> Bool {
        return jobSeeker != nil
    }
    
    func isRecruiter() -> Bool {
        return businesses.count > 0
    }
}
