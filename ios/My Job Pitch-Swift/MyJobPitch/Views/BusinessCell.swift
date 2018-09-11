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
        
        AppHelper.loadLogo(image: business.getImage(), imageView: imgView, completion: nil)
        nameLabel.text = business.name
        let locationCount = business.locations.count
        subTitle.text = String(format: "Includes %lu %@", locationCount, locationCount > 1 ? "workplaces" : "workplace")
        creditCount.text = String(format: "%@ %@", business.tokens, business.tokens.intValue > 1 ? "Credits" : "Credit")
        
    }
    
    func setUsersData(_ business: Business) {
        
        AppHelper.loadLogo(image: business.getImage(), imageView: imgView, completion: nil)
        
        nameLabel.text = business.name
        let userCount = business.users.count
        subTitle.text = String(format: "%lu %@", userCount, userCount > 1 ? "users" : "user")
        creditCount.isHidden = true
    }
    
}
