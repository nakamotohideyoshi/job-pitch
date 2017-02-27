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

    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var subTitle: UILabel!
    
    func setData(_ job: Job) {
        
        if let image = job.getImage() {
            AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        
        nameLabel.text = job.title
        subTitle.text = job.locationData.businessData.name + ", " + job.locationData.name
        
    }
    
    func setOpacity(_ alpha: CGFloat) {
        imgView.alpha = alpha
        nameLabel.alpha = alpha
        subTitle.alpha = alpha
    }
    
}
