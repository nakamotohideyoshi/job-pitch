//
//  LocationCell.swift
//  MyJobPitch
//
//  Created by dev on 1/13/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class LocationCell: MGSwipeTableCell {

    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var subTitle: UILabel!
    
    var location: Location! {
        didSet {
            if location != nil {
                AppHelper.loadLogo(location, imageView: imgView, completion: nil)
                nameLabel.text = location.name
                let jobCount = location.jobs.count
                subTitle.text = String(format: "Includes %lu %@", jobCount, jobCount == 1 ? "job" : "jobs")
            }
        }
    }        
}
