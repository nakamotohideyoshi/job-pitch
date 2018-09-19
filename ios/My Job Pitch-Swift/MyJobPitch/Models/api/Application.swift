//
//  Application.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class Application: MJPObjectWithDates {

    var job: Job!
    var jobSeeker: JobSeeker!
    var messages: NSArray!
    var createdBy: NSNumber!
    var deletedBy: NSNumber!
    var shortlisted = false
    var status: NSNumber!
    
    // API V3
    var pitches: NSArray!
    var interviews: NSArray!
    
}

class ApplicationForCreation: MJPObject {
    
    var jobSeeker: NSNumber!
    var job: NSNumber!
    var shortlisted = false
    
}

class ApplicationStatusUpdate: MJPObject {
    
    var status: NSNumber!
    
}

class ApplicationShortlistUpdate: MJPObject {
    
    var shortlisted = false
    
}

class ExternalApplicationForCreation: MJPObject {
    
//    var jobSeeker: JobSeeker!
    var job: NSNumber!
    var shortlisted = false
    
    var firstName: String!
    var lastName: String!
    var email: String!
    var telephone: String!
    var mobile: String!
    var age: NSNumber!
    var sex: NSNumber!
    var nationality: NSNumber!
    var emailPublic = true
    var telephonePublic = true
    var mobilePublic = true
    var agePublic = true
    var sexPublic = true
    var nationalityPublic = true
    var nationalInsuranceNumber: String!
    var desc: String!
    var hasReferences = false
    var truthConfirmation = false

}
