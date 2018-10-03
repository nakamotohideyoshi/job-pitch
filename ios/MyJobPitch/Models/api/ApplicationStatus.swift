//
//  ApplicationStatus.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class ApplicationStatus: MJPObjectWithName {

    static let APPLICATION_CREATED = "CREATED"
    static let APPLICATION_ESTABLISHED = "ESTABLISHED"
    static let APPLICATION_DELETED = "DELETED"
    static var APPLICATION_CREATED_ID: NSNumber = 0
    static var APPLICATION_ESTABLISHED_ID: NSNumber = 0
    static var APPLICATION_DELETED_ID: NSNumber = 0
    
    static let mappingDictionary = [ "friendlyName": "friendly_name",
                                     "desc":        "description" ]
    
    var friendlyName: String!
    var desc: String!    
}
