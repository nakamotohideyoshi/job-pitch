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
                    AppHelper.loadPhoto(application.jobSeeker, imageView: imgView, completion: nil)
                    name.text = application.jobSeeker.getFullName()
                    comment.text = application.jobSeeker.desc
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
                    status.text = AppData.user.isJobSeeker() ? "Interview request received" : "Interview request sent"
                } else if interview.status == InterviewStatus.INTERVIEW_ACCEPTED {
                    status.text = "Interview accepted"
                } else if interview.status == InterviewStatus.INTERVIEW_COMPLETED {
                    status.text = "This interview is done"
                } else {
                    status.text = "Interview cancelled by " + (AppData.user.isRecruiter() ? "Recruiter" : "Jobseeker")
                }
                
                dataTime.text = AppHelper.dateToLongString(interview.at)
            }
        }
    }
}

