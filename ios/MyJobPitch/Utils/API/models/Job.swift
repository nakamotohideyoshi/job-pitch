//
//  Job.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class Job: MJPObjectWithDates {
    
    static let mappingArray = [ "id", "title", "sector", "location", "contract", "hours", "status" ]
    
    static let mappingDictionary = [ "desc":           "description",
                                     "requiresPitch":  "requires_pitch",
                                     "requiresCV":     "requires_cv" ]

    var title: String!
    var desc: String!
    var sector: NSNumber!
    var location: NSNumber!
    var contract: NSNumber!
    var hours: NSNumber!
    var status: NSNumber!
    var locationData: Location!
    var images: NSArray!
    var videos: NSArray!
    
    // API V5
    var requiresPitch = false
    var requiresCV = false
    
    func getPitch() -> Pitch? {
        if videos != nil {
            for pitch in videos as! [Pitch] {
                if pitch.video != nil {
                    return pitch
                }
            }
        }
        return nil
    }
 
    func getImage() -> Image? {
        if images != nil && images.count > 0 {
            return images.firstObject as? Image
        }
        return locationData.getImage()
    }
    
    func getBusinessName() -> String {
        return locationData.businessData.name + ", " + locationData.name
    }
}

class HRJob: MJPObjectWithDates {
    
    static let mappingArray = [ "id", "title", "location" ]
    
    static let mappingDictionary = [ "desc": "description"]
    
    var title: String!
    var desc: String!
    var location: NSNumber!
}

