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
    var application: Application!
    var isEditMode = false
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        jobTitleView.text = String(format: "%@, (%@)", application.job.title, application.job.getBusinessName())
        
        self.scrollView.isScrollEnabled = false

        loadInterviewDetail()
        
    }
    
    func loadInterviewDetail() {
        if let image = application.jobSeeker.getPitch()?.thumbnail {
            AppHelper.loadImageURL(imageUrl: image, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "no-img")
        }
        cvDescription.text = application.jobSeeker.cv == nil ? "Can't find CV" : application.jobSeeker.cv
        jobSeekerName.text = application.jobSeeker.getFullName()
        
        if isEditMode {
        
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "E d MMM, yyyy"
            
            let dateFormatter1 = DateFormatter()
            dateFormatter1.dateFormat = "HH:mm"
            
            dateTimeLabel.text = String(format: "%@ at %@", dateFormatter.string(from: interview.at), dateFormatter1.string(from: interview.at))
            
            note.text = interview.note
        }
    }

    @IBAction func getDateTime(_ sender: Any) {
        let date = Date()
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "E d MMM, yyyy"
        
        let dateFormatter1 = DateFormatter()
        dateFormatter1.dateFormat = "HH:mm"
        
        dateTimeLabel.text = String(format: "%@ at %@", dateFormatter.string(from: date), dateFormatter1.string(from: date))
    }
    
    @IBAction func sendInvitation(_ sender: Any) {
        showLoading()
        
        if isEditMode {
            let interviewForUpdate = InterviewForUpdate()
            
            interviewForUpdate.at = Date()
            interviewForUpdate.application = application.id
            interviewForUpdate.note = note.text
            interviewForUpdate.feedback = ""
            interviewForUpdate.invitation = message.text
            
            API.shared().updateInterview(interviewId: interview.id, interview: interviewForUpdate, success: { (data) in
                self.doneCreateAction()
            }, failure: self.handleErrors)
        } else {
            
            let interviewForCreation = InterviewForCreation()
            
            interviewForCreation.at = Date()
            interviewForCreation.application = application.id
            interviewForCreation.note = note.text
            interviewForCreation.feedback = ""
            interviewForCreation.invitation = message.text
            
            API.shared().createInterview(interview: interviewForCreation, success: { (data) in
                self.doneCreateAction()
            }, failure: self.handleErrors)
            
        }
    }
    
    func doneCreateAction() {
        _ = navigationController?.popViewController(animated: true)
        return
    }
    
}
