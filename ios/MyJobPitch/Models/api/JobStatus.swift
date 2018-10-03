//
//  JobStatus.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class JobStatus: MJPObjectWithName {

    static let JOB_STATUS_OPEN = "OPEN"
    static let JOB_STATUS_CLOSED = "CLOSED"    
    static var JOB_STATUS_OPEN_ID: NSNumber = 0
    static var JOB_STATUS_CLOSED_ID: NSNumber = 0
    
    static let mappingDictionary = [ "friendlyName": "friendly_name",
                                     "desc":        "description" ]
    
    var friendlyName: String!
    var desc: String!    
}
