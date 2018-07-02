//
//  Interview.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/30/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class Interview: MJPObject {
    var application: NSNumber!
    var at: Date!
    var messages: NSArray!
    var note: String!
    var feedback: String!
    var cancelled: Date!
    var cancelledBy: NSNumber!
}

class InterviewForCancel: MJPObject {
    var cancelled: Date!
    var cancelledBy: NSNumber!
}

class InterviewForCreation: MJPObject {
    var invitation:String!
    var at: Date!
    var application: NSNumber!
    var note: String!
    var feedback: String!
}

class InterviewForUpdate: MJPObject {
    var invitation:String!
    var at: Date!
    var application: NSNumber!
    var note: String!
    var feedback: String!
}
