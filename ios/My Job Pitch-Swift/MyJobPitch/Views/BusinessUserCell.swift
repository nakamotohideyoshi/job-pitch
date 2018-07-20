//
//  BusinessUserCell.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/21/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class BusinessUserCell: MGSwipeTableCell {
    @IBOutlet weak var email: UILabel!
    @IBOutlet weak var subTitle: UILabel!
    

    func setData(_ businessUser: BusinessUser, _ locations: [Location]) {
        email.text = businessUser.email
        subTitle.text = nil
        if businessUser.locations.count == 0 {
            subTitle.text = "Administrator"
            if businessUser.email == AppData.user.email {
                subTitle.text = "Administrator (Current User)"
            }
        } else {
            for location in locations {
                if businessUser.locations.contains(location.id) {
                    if subTitle.text == nil {
                        subTitle.text = location.name
                    } else {
                        subTitle.text = "\(subTitle.text!), \(location.name!)"
                    }
                }
            }
        }
    }

}
