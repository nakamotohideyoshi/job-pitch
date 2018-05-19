//
//  Job.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import Foundation

class Job: MJPObjectWithDates {

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
    
    func getPitch() -> JobPitch? {
        if videos != nil {
            for pitch in videos as! [JobPitch] {
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