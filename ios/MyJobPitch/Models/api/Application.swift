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
    
    static let mappingArray = [ "id", "job", "shortlisted" ]
    static let mappingDictionary = ["jobSeeker": "job_seeker"]
    
    var job: NSNumber!
    var jobSeeker: NSNumber!
    var shortlisted = false
}

class ExternalApplicationForCreation: NSObject {
    
    static let mappingArray = [ "job", "shortlisted" ]
    static let mappingDictionary = ["jobSeeker": "job_seeker"]
    
    var job: NSNumber!
    var jobSeeker: [String: Any]!
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
