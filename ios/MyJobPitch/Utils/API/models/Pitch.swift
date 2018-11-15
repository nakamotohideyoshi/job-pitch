//
//  Pitch.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class Pitch: MJPObject {
    
    static var mappingArray = ["id", "video", "thumbnail", "token"]
    
    var video: String!
    var thumbnail: String!
    var token: String!
    
}

class SpecificPitchForCreation: NSObject {
    
    static var mappingDictionary = ["jobseeker": "job_seeker"]

    var jobseeker: NSNumber!
}

class JobPitchForCreation: NSObject {
    
    static var mappingArray = ["job"]

    var job: NSNumber!    
}
