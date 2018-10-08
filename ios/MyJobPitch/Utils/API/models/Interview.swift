//
//  Interview.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/30/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class Interview: MJPObject {
    static let mappingArray = [ "id", "at", "notes", "feedback", "cancelled", "status" ]
    static let mappingDictionary = [ "cancelledBy": "cancelled_by" ]
    
    var at: Date!
    var messages: NSArray!
    var notes: String!
    var feedback: String!
    var cancelled: Date!
    var cancelledBy: NSNumber!
    var status: String!
}

class InterviewForSave: MJPObject {
    static let mappingArray = [ "invitation", "application", "at", "notes", "feedback" ]
    
    var invitation:String!
    var at: Date!
    var application: NSNumber!
    var notes: String!
    var feedback: String!
}
