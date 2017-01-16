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
    
    func setData(_ location: Location) {
        
        if let image = location.getImage() {
            AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        
        nameLabel.text = location.name
        let jobCount = location.jobs.count
        subTitle.text = String(format: "Includes %lu %@", jobCount, jobCount == 1 ? "job" : "jobs")
        
    }
    
}
