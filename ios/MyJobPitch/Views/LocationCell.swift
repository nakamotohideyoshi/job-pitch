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
                if jobCount == 1 {
                    subTitle.text = String(format: NSLocalizedString("Includes %lu job", comment: ""), jobCount)
                } else {
                    subTitle.text = String(format: NSLocalizedString("Includes %lu jobs", comment: ""), jobCount)
                }
            }
        }
    }        
}
