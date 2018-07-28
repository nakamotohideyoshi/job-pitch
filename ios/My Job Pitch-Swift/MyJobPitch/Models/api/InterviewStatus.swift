//
//  InterviewStatus.swift
//  MyJobPitch
//
//  Created by TIGER1 on 7/30/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import Foundation

class InterviewStatus: MJPObjectWithNameDesc {
    
    static let INTERVIEW_PENDING = "PENDING"
    static let INTERVIEW_ACCEPTED = "ACCEPTED"
    static let INTERVIEW_COMPLETED = "COMPLETED"
    static let INTERVIEW_CANCELLED = "CANCELLED"
    
    var friendlyName: String!
    
}
