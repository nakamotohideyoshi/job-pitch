//
//  PasswordChangeRequest.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class PasswordChangeRequest: NSObject {

    static let mappingDictionary = [ "password1": "new_password1",
                                     "password2": "new_password2"]
    
    var password1: String!
    var password2: String!
    
}
