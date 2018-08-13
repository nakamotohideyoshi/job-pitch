//
//  Message.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class Message: MJPObject {

    var system = false
    var content: String!
    var read = false
    var created: Date!
    var application: NSNumber!
    var fromRole: NSNumber!
    
    // API V3
    var interview: NSNumber!
    
}

class MessageForCreation: MJPObject {
    
    var content: String!
    var application: NSNumber!
    
}

class MessageForUpdate: MJPObject {
    
    var read = true
    var fromRole: NSNumber!
    
}
