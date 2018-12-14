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
    
    var application: Application! {
        didSet {
            if application != nil {
                let job = application.job!
                let lastMessage = application.messages?.lastObject as! Message
                let message = lastMessage.fromRole == AppData.userRole ? String(format: "%@: %@", NSLocalizedString("You", comment: ""), (lastMessage.content)!) : lastMessage.content
                let deleted = application.status == ApplicationStatus.APPLICATION_DELETED_ID
                
                var title: String!, subTitle: String!
                if AppData.user.isJobseeker() {
                    AppHelper.loadLogo(job, imageView: imgView, completion: nil)
                    title = job.title
                    subTitle = job.getBusinessName()
                } else {
                    AppHelper.loadPhoto(application.jobseeker, imageView: imgView, completion: nil)
                    title = application.jobseeker.getFullName()
                    subTitle = String(format: "%@ (%@)", job.title, job.getBusinessName())
                }
                
                imgView.alpha = deleted ? 0.5 : 1
                titleLabel.setDeletedText(title, isDeleted: deleted)
                subTitleLabel.setDeletedText(subTitle, isDeleted: deleted)
                attributesLabel.setDeletedText(AppHelper.dateToShortString((lastMessage.created)!), isDeleted: deleted)
                messageLabel.setDeletedText(message!, isDeleted: deleted)
                
                backgroundColor = deleted ? AppData.lightGreyColor : .white
                
                badge.layer.borderWidth = 1
                badge.layer.borderColor = UIColor.white.cgColor
            }
        }
    }
    
    var newMsgs: Int! {
        didSet {
            badge.text = newMsgs < 10 ? String(newMsgs) : "9+"
            badge.isHidden = newMsgs == 0
        }
    }
}
