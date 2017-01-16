//
//  BusinessCell.swift
//  MyJobPitch
//
//  Created by dev on 1/13/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class BusinessCell: MGSwipeTableCell {

    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var subTitle: UILabel!
    @IBOutlet weak var creditCount: UILabel!
    
    func setData(_ business: Business) {
        
        if let image = business.getImage() {
            AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        
        nameLabel.text = business.name
        let locationCount = business.locations.count
        subTitle.text = String(format: "Includes %lu %@", locationCount, locationCount == 1 ? "location" : "locations")
        creditCount.text = String(format: "%@ Credit", business.tokens)
        
    }
    
}
