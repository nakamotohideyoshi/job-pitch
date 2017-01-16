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
