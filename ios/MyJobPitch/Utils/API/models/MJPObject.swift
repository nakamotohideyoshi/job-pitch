//
//  MJPObject.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class MJPObject: NSObject {

    var id: NSNumber!
    
    override func isEqual(_ object: Any?) -> Bool {
        let mjpObject = object as? MJPObject
        if mjpObject != nil {
            return id == (object as! MJPObject).id
        }
        return false
    }
    
    
}
