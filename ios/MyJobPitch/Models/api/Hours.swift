//
//  Hours.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class Hours: MJPObjectWithName {
    
    static let mappingDictionary = [ "shortName":    "short_name",
                                     "desc":         "description" ]
    
    var shortName: String!
    var desc: String!
}
