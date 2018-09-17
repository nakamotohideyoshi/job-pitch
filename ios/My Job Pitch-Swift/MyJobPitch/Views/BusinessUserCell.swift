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

    func setData(_ user: BusinessUser, _ locations: String) {
        email.text = user.email
        subTitle.text = locations
        
        accessoryType = user.email == AppData.user.email ? .none : .disclosureIndicator
        addUnderLine(paddingLeft: 12, paddingRight: 0, color: AppData.greyColor)
    }

}
