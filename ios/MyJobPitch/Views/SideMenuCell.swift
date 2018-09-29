
//
//  SideMenuCell.swift
//  MyJobPitch
//
//  Created by dev on 1/9/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

class SideMenuCell: UITableViewCell {

    @IBOutlet weak var iconView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var badge: BadgeIcon!
    
    func addLine(frame: CGRect, color: UIColor) {
        let border = CALayer()
        border.borderColor = color.cgColor
        border.borderWidth = 0.5
        border.frame = frame
        layer.addSublayer(border)
    }
}
