//
//  JobSeeker.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class JobSeeker: MJPObjectWithDates {
    
    var active = true
    var firstName: String!
    var lastName: String!
    var email: String!
    var telephone: String!
    var mobile: String!
    var age: NSNumber!
    var sex: NSNumber!
    var nationality: NSNumber!
    var emailPublic = true
    var telephonePublic = true
    var mobilePublic = true
    var agePublic = true
    var sexPublic = true
    var nationalityPublic = true
    var hasReferences = false
    var truthConfirmation = false
    var profile: NSNumber!
    var pitches: NSArray!
    var desc: String!
    var cv: String!
    
    func getPitch() -> Pitch? {
        if pitches != nil {
            for pitch in pitches as! [Pitch] {
                if pitch.video != nil {
                    return pitch
                }
            }
        }
        return nil
    }
    
    func getFullName() -> String {
        return firstName + " " + lastName
    }

}
