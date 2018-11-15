//
//  Employee.swift
//  MyJobPitch
//
//  Created by bb on 11/12/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class BaseEmployee: MJPObjectWithDates {
    var firstName: String!
    var lastName: String!
    var email: String!
    var telephone: String!
    var sex: NSNumber!
    var birthday: String!
    var nationality: NSNumber!
    var national_insurance_number: String!
    
    var business: NSNumber!
    
    var profileImage: String!
    var profileThumb: String!
    
    func getFullName() -> String {
        return firstName + " " + lastName
    }
}

class HREmployee: BaseEmployee {

    static let mappingReqArray = [ "email", "telephone", "sex", "birthday", "nationality", "national_insurance_number", "business", "job" ]
    
    static let mappingReqDictionary = [ "firstName":            "first_name",
                                        "lastName":             "last_name" ]
    
    static let mappingArray = [ "id", "email", "telephone", "sex", "birthday", "nationality", "national_insurance_number", "business", "job" ]
    
    static let mappingDictionary = [ "firstName":            "first_name",
                                     "lastName":             "last_name",
                                     "profileImage":         "profile_image",
                                     "profileThumb":         "profile_thumb" ]
    
    var job: NSNumber!
}

class Employee: BaseEmployee {
    
    static let mappingArray = [ "id", "email", "telephone", "sex", "birthday", "nationality", "national_insurance_number", "business" ]
    
    static let mappingDictionary = [ "firstName":            "first_name",
                                     "lastName":             "last_name",
                                     "profileImage":         "profile_image",
                                     "profileThumb":         "profile_thumb" ]
    
    var job: HRJob!
}
