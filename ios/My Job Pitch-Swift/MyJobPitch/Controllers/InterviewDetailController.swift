//
//  InterviewDetailController.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/28/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class InterviewDetailController: MJPController {
    @IBOutlet weak var jobTitleView: UILabel!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var jobSeekerName: UILabel!
    @IBOutlet weak var cvDescription: UILabel!
    
    @IBOutlet weak var status: UILabel!
    @IBOutlet weak var dataTime: UILabel!
    @IBOutlet weak var location: UILabel!
    @IBOutlet weak var feedbackLabel: UILabel!
    @IBOutlet weak var feedbackContent: UILabel!
    @IBOutlet weak var noteLabel: UILabel!
    @IBOutlet weak var noteContent: UILabel!
    
    @IBOutlet weak var editButton: GreenButton!
    @IBOutlet weak var completeButton: GreenButton!
    @IBOutlet weak var acceptButton: GreenButton!
    @IBOutlet weak var messageButton: GreenButton!
    @IBOutlet weak var cancelButton: YellowButton!
    @IBOutlet weak var messageButton1: GreenButton!
    
    @IBOutlet weak var cancelButton1: YellowButton!
    
    var interview: Interview!
    var interviewId: NSNumber!
    var application: Application!
    
    var refresh = true
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        jobTitleView.text = String(format: "%@, (%@)", application.job.title, application.job.getBusinessName())
        self.scrollView.isScrollEnabled = false
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        if refresh {
            refresh = false
            showLoading()
            loadInterview()
        }
    }
    
    func loadInterview() {
        API.shared().loadInterview(interviewId: interviewId, success: { (data) in
            self.interview = data as! Interview
            self.hideLoading()
            self.loadInterviewDetail()
        }, failure: self.handleErrors)
    }
    
    func loadInterviewDetail() {
        if let image = application.jobSeeker.getPitch()?.thumbnail {
            AppHelper.loadImageURL(imageUrl: image, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "no-img")
        }
        cvDescription.text = application.jobSeeker.cv == nil ? "Can't find CV" : application.jobSeeker.cv
        jobSeekerName.text = application.jobSeeker.getFullName()
        // Status
        let interviewStatus = interview.cancelledBy == nil ? "Pending" : "Complete";
        let applicationStatus = application.status == 1 ? "Undecided" : (application.status == 2 ? "Accepted" : "Rejected");
        status.text = String(format:"%@ (%@)", interviewStatus, applicationStatus)
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "E d MMM, yyyy"
        
        let dateFormatter1 = DateFormatter()
        dateFormatter1.dateFormat = "HH:mm"
        
        dataTime.text = String(format: "%@ at %@", dateFormatter.string(from: interview.at), dateFormatter1.string(from: interview.at))
        location.text = application.job.locationData.name
        
        feedbackContent.text = interview.feedback
        noteContent.text = interview.note
        
        if AppData.user.isRecruiter() {
            acceptButton.isHidden = true
            messageButton1.isHidden = true
            cancelButton1.isHidden = true
        } else {
            feedbackLabel.isHidden = true
            feedbackContent.isHidden = true
            noteContent.isHidden = true
            noteLabel.isHidden = true
            editButton.isHidden = true
            completeButton.isHidden = true
            messageButton.isHidden = true
            cancelButton.isHidden = true
        }
    }

    @IBAction func interviewEdit(_ sender: Any) {
        refresh = true
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "InterviewEdit") as! InterviewEditController
        controller.interview = interview
        controller.application = application
        controller.isEditMode = true
        navigationController?.pushViewController(controller, animated: true)
    }
    
    @IBAction func completeInterview(_ sender: Any) {
    }

    @IBAction func acceptInvitation(_ sender: Any) {
    }
    
    @IBAction func goToMessage(_ sender: Any) {
        MessageController0.showModal(application: application)
    }
    
    @IBAction func cancel(_ sender: Any) {
        _ = navigationController?.popViewController(animated: true)
        return
    }
    
}
