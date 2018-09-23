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
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var subTitle: UILabel!
    
    var job: Job! {
        didSet {
            if job != nil {
                let deleted = job.status != JobStatus.JOB_STATUS_OPEN_ID
                AppHelper.loadLogo(job, imageView: imgView, completion: nil)
                imgView.alpha = deleted ? 0.5 : 1
                titleLabel.setDeletedText(job.title, isDeleted: deleted)
                subTitle.setDeletedText(job.getBusinessName(), isDeleted: deleted)
                backgroundColor = deleted ? AppData.lightGreyColor : .white
            }
        }
    }
}
