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
    @IBOutlet weak var jobSeekerName: UILabel!
    
    @IBOutlet weak var cvDescription: UILabel!
    
    @IBOutlet weak var location: UILabel!
    @IBOutlet weak var dataTime: UILabel!
    @IBOutlet weak var status: UILabel!
    
    func setData(_ interview: Interview, _ application: Application) {
        
        if AppData.user.isRecruiter() {
        
            if let image = application.jobSeeker.getPitch()?.thumbnail {
                AppHelper.loadImageURL(imageUrl: image, imageView: imgView, completion: nil)
            } else {
                imgView.image = UIImage(named: "default-logo")
            }
            cvDescription.text = application.jobSeeker.desc
            jobSeekerName.text = application.jobSeeker.getFullName()
            
        } else {
            if let image = application.job.getImage()?.thumbnail {
                AppHelper.loadImageURL(imageUrl: image, imageView: imgView, completion: nil)
            } else {
                imgView.image = UIImage(named: "default-logo")
            }
            cvDescription.text = application.job.desc
            jobSeekerName.text = application.job.title
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
        
        location.text = application.job.locationData.name
        
    }
}
