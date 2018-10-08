//
//  JobSeeker.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class JobSeeker: MJPObjectWithDates {
    
    static let mappingReqArray = [ "active", "email", "telephone", "mobile", "age", "sex", "nationality", "national_insurance_number" ]
    
    static let mappingReqDictionary = [ "firstName":            "first_name",
                                       "lastName":             "last_name",
                                       "desc":                 "description",
                                       "emailPublic":          "email_public",
                                       "telephonePublic":      "telephone_public",
                                       "mobilePublic":         "mobile_public",
                                       "agePublic":            "age_public",
                                       "sexPublic":            "sex_public",
                                       "nationalityPublic":    "nationality_public",
                                       "hasReferences":        "has_references",
                                       "truthConfirmation":    "truth_confirmation" ]
    
    static let mappingArray = [ "id", "email", "telephone", "mobile", "age", "sex", "nationality", "national_insurance_number",
                                "has_national_insurance_number", "profile", "cv", "active" ]
    
    static let mappingDictionary = [ "firstName":            "first_name",
                                "lastName":             "last_name",
                                "desc":                 "description",
                                "emailPublic":          "email_public",
                                "telephonePublic":      "telephone_public",
                                "mobilePublic":         "mobile_public",
                                "agePublic":            "age_public",
                                "sexPublic":            "sex_public",
                                "nationalityPublic":    "nationality_public",
                                "hasReferences":        "has_references",
                                "truthConfirmation":    "truth_confirmation",
                                "profileImage":         "profile_image",
                                "profileThumb":         "profile_thumb" ]
    
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
    var national_insurance_number: String!
    var has_national_insurance_number = false
    var profile: NSNumber!
    var pitches: NSArray!
    var desc: String!
    var cv: String!
    
    // API V4
    var profileImage: String!
    var profileThumb: String!
    
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
