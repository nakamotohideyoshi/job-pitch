//
//  RegisterRequest.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class RegisterRequest: NSObject {
    
    static let mappingArray = [ "email", "password1", "password2" ]

    var email: String!
    var password1: String!
    var password2: String!
    
}
