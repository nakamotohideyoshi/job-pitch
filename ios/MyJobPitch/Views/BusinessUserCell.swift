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
    
    var user: BusinessUser! {
        didSet {
            if user != nil {
                email.text = user.email
                accessoryType = user.email == AppData.user.email ? .none : .disclosureIndicator
            }
        }
    }
}
