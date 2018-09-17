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
    
    func setData(_ application: Application, _ interview: ApplicationInterview) {
        
        if AppData.user.isRecruiter() {
        
            AppHelper.loadJobseekerAvatar(application.jobSeeker, imageView: imgView, completion: nil)
            name.text = application.jobSeeker.getFullName()
            comment.text = application.jobSeeker.desc
            
        } else {
            AppHelper.loadLogo(image: application.job.getImage(), imageView: imgView, completion: nil)
            name.text = application.job.title
            comment.text = application.job.getBusinessName()
        }
        
        if interview.status == InterviewStatus.INTERVIEW_PENDING {
            
            status.text = "Interview request sent"
            
        } else if interview.status == InterviewStatus.INTERVIEW_ACCEPTED {
            
            status.text = "Interview accepted"
            
        } else if interview.status == InterviewStatus.INTERVIEW_COMPLETED {
            
            status.text = "This interview is done"
            
        } else if interview.status == InterviewStatus.INTERVIEW_CANCELLED {
            
            status.text = "Interview cancelled by " + (AppData.user.isRecruiter() ? "Recruiter" : "Jobseeker")
        }
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "E d MMM, yyyy"
        let dateFormatter1 = DateFormatter()
        dateFormatter1.dateFormat = "HH:mm"
        dataTime.text = String(format: "%@ at %@", dateFormatter.string(from: interview.at), dateFormatter1.string(from: interview.at))
        
        location.text = application.job.locationData.placeName
        
    }
}
