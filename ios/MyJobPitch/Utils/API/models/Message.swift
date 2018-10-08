//
//  Message.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class Message: MJPObject {
    
    static let mappingArray = [ "id", "system", "content", "read", "created", "application", "interview" ]
    static let mappingDictionary = [ "fromRole": "from_role" ]

    var system = false
    var content: String!
    var read = false
    var created: Date!
    var application: NSNumber!
    var fromRole: NSNumber!
    
    // API V3
    var interview: NSNumber!
}

class MessageForCreation: NSObject {
    
    static let mappingArray = [ "application", "content" ]
    
    var content: String!
    var application: NSNumber!
}

class MessageForUpdate: MJPObject {
    
    static let mappingArray = [ "read" ]

    var read = true
}
