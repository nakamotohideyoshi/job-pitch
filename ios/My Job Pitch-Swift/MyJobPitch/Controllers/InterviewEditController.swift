//
//  InterviewEditController.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/29/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class InterviewEditController: MJPController {
    @IBOutlet weak var jobTitleView: UILabel!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var jobSeekerName: UILabel!
    @IBOutlet weak var cvDescription: UILabel!
    @IBOutlet weak var dateTimeLabel: UILabel!
    @IBOutlet weak var dateTimeButton: UIButton!
    @IBOutlet weak var message: UITextView!
    @IBOutlet weak var note: UITextView!
    
    var interview: Interview!
    var job: Job!
    var application: Application!
    var isEditMode = false
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        jobTitleView.text = String(format: "%@, (%@)", job.title, job.getBusinessName())
        
        self.scrollView.isScrollEnabled = false

        // Do any additional setup after loading the view.
        if interview != nil {
            loadInterviewDetail()
        }
    }
    
    func loadInterviewDetail() {
        if let image = application.jobSeeker.getPitch()?.thumbnail {
            AppHelper.loadImageURL(imageUrl: image, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "no-img")
        }
        cvDescription.text = application.jobSeeker.cv == nil ? "Can't find CV" : application.jobSeeker.cv
        jobSeekerName.text = application.jobSeeker.getFullName()
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "E d MMM, yyyy"
        
        let dateFormatter1 = DateFormatter()
        dateFormatter1.dateFormat = "HH:mm"
        
        dateTimeLabel.text = String(format: "%@ at %@", dateFormatter.string(from: interview.at), dateFormatter1.string(from: interview.at))
        
        
        note.text = interview.note
    }

    @IBAction func getDateTime(_ sender: Any) {
    }
    
    @IBAction func sendInvitation(_ sender: Any) {
    }
    
}
