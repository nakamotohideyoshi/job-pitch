//
//  InterviewCell.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/26/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class InterviewCell: MGSwipeTableCell {

    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var name: UILabel!
    @IBOutlet weak var comment: UILabel!
    
    @IBOutlet weak var location: UILabel!
    @IBOutlet weak var dataTime: UILabel!
    @IBOutlet weak var status: UILabel!
    
    var application: Application! {
        didSet {
            if application != nil {
                if AppData.user.isRecruiter() {
                    AppHelper.loadPhoto(application.jobseeker, imageView: imgView, completion: nil)
                    name.text = application.jobseeker.getFullName()
                    comment.text = application.jobseeker.desc
                } else {
                    AppHelper.loadLogo(application.job, imageView: imgView, completion: nil)
                    name.text = application.job.title
                    comment.text = application.job.getBusinessName()
                }
                
                location.text = application.job.locationData.placeName
            }
        }
    }
    
    var interview: Interview! {
        didSet {
            if interview != nil {
                if interview.status == InterviewStatus.INTERVIEW_PENDING {
                    status.text = AppData.user.isJobseeker() ? NSLocalizedString("Interview request received", comment: "") : NSLocalizedString("Interview request sent", comment: "")
                } else if interview.status == InterviewStatus.INTERVIEW_ACCEPTED {
                    status.text = NSLocalizedString("Interview accepted", comment: "")
                } else if interview.status == InterviewStatus.INTERVIEW_COMPLETED {
                    status.text = NSLocalizedString("This interview is done", comment: "")
                } else {
                    if AppData.userRole === Role.ROLE_RECRUITER_ID {
                        status.text = NSLocalizedString("Interview cancelled by Recruiter", comment: "")
                    } else {
                        status.text = NSLocalizedString("Interview cancelled by Jobseeker", comment: "")
                    }                    
                }
                
                dataTime.text = AppHelper.dateToLongString(interview.at)
            }
        }
    }
}

