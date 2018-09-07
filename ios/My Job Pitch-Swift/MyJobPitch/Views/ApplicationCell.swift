//
//  ApplicationCell.swift
//  MyJobPitch
//
//  Created by dev on 12/26/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class ApplicationCell1: MGSwipeTableCell {

    @IBOutlet weak var imgView: UIImageView!;
    @IBOutlet weak var jobTitle: UILabel!;
    @IBOutlet weak var businessName: UILabel!;
    @IBOutlet weak var location: UILabel!;
    @IBOutlet weak var desc: UILabel!;
    
    func setData(_ job: Job) {
        AppHelper.loadLogo(image: job.getImage(), imageView: imgView, completion: nil)
        jobTitle.text = job.title
        businessName.text = job.getBusinessName()
        location.text = job.locationData.placeName
        desc.text = job.desc
    }

}

class ApplicationCell2: MGSwipeTableCell {
    
    @IBOutlet weak var imgView: UIImageView!;
    @IBOutlet weak var starIcon: UIImageView!
    @IBOutlet weak var name: UILabel!;
    @IBOutlet weak var jobTitle: UILabel!;
    @IBOutlet weak var businessName: UILabel!;
    @IBOutlet weak var location: UILabel!;    
    
    func setData(_ application: Application) {
        AppHelper.loadJobseekerImage(application.jobSeeker, imageView: imgView, completion: nil)
        name.text = application.jobSeeker.getFullName()
        jobTitle.text = application.job.title
        businessName.text = application.job.getBusinessName()
        location.text = application.job.locationData.placeName
        starIcon.isHidden = SideMenuController.currentID != "connections" || !application.shortlisted
    }
    
}
