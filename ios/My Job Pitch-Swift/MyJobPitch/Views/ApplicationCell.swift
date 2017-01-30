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
        
        if let image = job.getImage() {
            AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        
        jobTitle.text = job.title
        businessName.text = job.locationData.businessData.name + ", " + job.locationData.name
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
        
        if let image = application.jobSeeker.getPitch()?.thumbnail {
            AppHelper.loadImageURL(imageUrl: image, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "no-img")
        }
        
        name.text = application.jobSeeker.firstName + " " + application.jobSeeker.lastName
        jobTitle.text = application.job.title
        businessName.text = application.job.locationData.businessData.name + ", " + application.job.locationData.name
        location.text = application.job.locationData.placeName
        starIcon.isHidden = SideMenuController.currentID != "connections" || !application.shortlisted
    }
    
}
