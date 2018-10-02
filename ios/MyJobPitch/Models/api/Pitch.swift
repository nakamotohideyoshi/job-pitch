//
//  Pitch.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class PitchObject: MJPObject {
    
    var video: String!
    var thumbnail: String!
    var token: String!
    
}


class Pitch: PitchObject {

    var job_seeker: NSNumber!
    
}

class SpecificPitch: PitchObject {
    
    var job_seeker: NSNumber!
    var application: NSNumber!
    
}

class JobPitch: PitchObject {
    
    var job: NSNumber!
    
}
