//
//  ApplicationInterviewCell.swift
//  MyJobPitch
//
//  Created by TIGER1 on 8/20/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class ApplicationInterviewCell: MGSwipeTableCell {

    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var jobSeekerName: UILabel!
    
    @IBOutlet weak var cvDescription: UILabel!
    
    @IBOutlet weak var location: UILabel!
    @IBOutlet weak var dataTime: UILabel!
    
    func setData(_ interview: ApplicationInterview, _ application: Application) {
        
        if AppData.user.isRecruiter() {
            
            AppHelper.loadJobseekerAvatar(application.jobSeeker, imageView: imgView, completion: nil)
            cvDescription.text = application.jobSeeker.desc
            jobSeekerName.text = application.jobSeeker.getFullName()
            
        } else {
            AppHelper.loadLogo(image: application.job.getImage(), imageView: imgView, completion: nil)
            cvDescription.text = application.job.desc
            jobSeekerName.text = application.job.title
        }
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "E d MMM, yyyy"
        
        let dateFormatter1 = DateFormatter()
        dateFormatter1.dateFormat = "HH:mm"
        
        dataTime.text = String(format: "%@ at %@", dateFormatter.string(from: interview.at), dateFormatter1.string(from: interview.at))
        
        location.text = application.job.locationData.name
        
    }

}
