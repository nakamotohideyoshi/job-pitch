//
//  MessageCell.swift
//  MyJobPitch
//
//  Created by dev on 12/26/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

class MessageCell: UITableViewCell {

    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var subTitleLabel: UILabel!
    @IBOutlet weak var attributesLabel: UILabel!
    @IBOutlet weak var messageLabel: UILabel!
    @IBOutlet weak var badge: BadgeIcon!
    
    func setOpacity(_ alpha: CGFloat) {
        imgView.alpha = alpha
//        titleLabel.alpha = alpha
//        subTitleLabel.alpha = alpha
//        attributesLabel.alpha = alpha
//        messageLabel.alpha = alpha
    }
}
