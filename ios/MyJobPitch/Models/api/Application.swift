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
    var pitches: NSArray!
    var interviews: NSArray!
    
    func getInterview() -> Interview! {
        let filters = (interviews as! [Interview]).filter { $0.status == InterviewStatus.INTERVIEW_PENDING || $0.status == InterviewStatus.INTERVIEW_ACCEPTED }
        return filters.count == 0 ? nil : filters[0]
    }
    
    func getNewMessageCount() -> Int {
        var count = 0
        for message in messages.reversed() as! [Message] {
            if message.read {
                break
            }
            if message.fromRole == AppData.userRole {
                break
            }
            count += 1
        }
        return count
    }
}

class ApplicationForCreation: MJPObject {
    
    var jobSeeker: NSNumber!
    var job: NSNumber!
    var shortlisted = false
}

class ExclusionJobSeeker: MJPObject {
    var job: NSNumber!
    var jobSeeker: NSNumber!
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
