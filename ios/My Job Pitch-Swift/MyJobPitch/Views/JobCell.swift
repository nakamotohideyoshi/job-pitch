//
//  JobCell.swift
//  MyJobPitch
//
//  Created by dev on 12/23/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class JobCell: MGSwipeTableCell {

    @IBOutlet weak var imgView: UIImageView!;
    @IBOutlet weak var jobTitle: UILabel!;
    @IBOutlet weak var businessName: UILabel!;
    @IBOutlet weak var location: UILabel!;
    @IBOutlet weak var desc: UILabel!;

    func setData(_ job: Job) {
        
        if let image = job.getImage() {
            AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        
        jobTitle.text = job.title
        businessName.text = job.locationData.businessData.name + ", " + job.locationData.name
        location.text = job.locationData.placeName
        desc.text = job.desc
    }
    
}
