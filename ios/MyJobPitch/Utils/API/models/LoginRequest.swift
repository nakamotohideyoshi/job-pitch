//
//  LoginRequest.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class LoginRequest: NSObject {
    
    static let mappingArray = [ "email", "password" ]

    var email: String!
    var password: String!
    
}
