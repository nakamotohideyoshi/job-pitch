//
//  Image.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class Image: MJPObject {
    
    static var mappingArray = [ "id", "image", "thumbnail" ]

    var image: String!
    var thumbnail: String!
    
}
