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
    @IBOutlet weak var feedbackContent: UILabel!
    @IBOutlet weak var noteContent: UILabel!
    
    @IBOutlet weak var feedbackView: UIView!
    @IBOutlet weak var notesView: UIView!
    @IBOutlet weak var editBtnView: UIView!
    @IBOutlet weak var newBtnView: UIView!
    @IBOutlet weak var acceptBtnView: UIView!
    @IBOutlet weak var completeBtnView: UIView!
    @IBOutlet weak var messageBtnView: UIView!
    @IBOutlet weak var cancelBtnView: UIView!
    
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
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "E d MMM, yyyy"
        
        let dateFormatter1 = DateFormatter()
        dateFormatter1.dateFormat = "HH:mm"
        
        dataTime.text = String(format: "%@ at %@", dateFormatter.string(from: interview.at), dateFormatter1.string(from: interview.at))
        location.text = application.job.locationData.name
        
        feedbackContent.text = interview.feedback
        noteContent.text = interview.notes
        
        feedbackView.isHidden = true
        
        if AppData.user.isRecruiter() {
            acceptBtnView.isHidden = true
            if interview.status == InterviewStatus.INTERVIEW_COMPLETED || interview.status == InterviewStatus.INTERVIEW_CANCELLED {
                editBtnView.isHidden = true
                newBtnView.isHidden = false
            } else {
                newBtnView.isHidden = true
            }
        } else {
            notesView.isHidden = true
            editBtnView.isHidden = true
            completeBtnView.isHidden = true
            messageBtnView.isHidden = true
            cancelBtnView.isHidden = true
        }
        
        if interview.status == InterviewStatus.INTERVIEW_PENDING {
            
            status.text = "Interview request sent"
            
        } else if interview.status == InterviewStatus.INTERVIEW_ACCEPTED {
            
            status.text = "Interview accepted"
            acceptBtnView.isHidden = true
            
        } else if interview.status == InterviewStatus.INTERVIEW_COMPLETED {
            
            status.text = "This interview is done"
            feedbackView.isHidden = false
            completeBtnView.isHidden = true
            cancelBtnView.isHidden = true
            acceptBtnView.isHidden = true
            
        } else if interview.status == InterviewStatus.INTERVIEW_CANCELLED {
            
            status.text = "Interview cancelled by " + (AppData.user.isRecruiter() ? "Recruiter" : "Jobseeker")
            completeBtnView.isHidden = true
            cancelBtnView.isHidden = true
            acceptBtnView.isHidden = true
            
        }
        
    }

    @IBAction func interviewEdit(_ sender: Any) {
        refresh = true
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "InterviewEdit") as! InterviewEditController
        controller.application = application
            controller.interview = interview
            controller.isEditMode = true
        navigationController?.pushViewController(controller, animated: true)
    }
    @IBAction func arrangeNewInterview(_ sender: Any) {
        
        refresh = true
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "InterviewEdit") as! InterviewEditController
        controller.application = application
            controller.isEditMode = false
        navigationController?.pushViewController(controller, animated: true)
    }
    
    @IBAction func completeInterview(_ sender: Any) {
        showLoading()
        
        API.shared().completeInterview(interviewId: interview.id, success: { (data) in
            self.actionDone()
        }, failure: self.handleErrors)
    }

    @IBAction func acceptInvitation(_ sender: Any) {
        showLoading()
        
        API.shared().acceptInterview(interviewId: interview.id, success: { (data) in
            self.actionDone()
        }, failure: self.handleErrors)
    }
    
    @IBAction func goToMessage(_ sender: Any) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Message0") as! MessageController0
        controller.application = application
        controller.interview = interview
        AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
    }
    
    @IBAction func cancel(_ sender: Any) {
        showLoading()
        
        API.shared().deleteInterview(interviewId: interview.id, success: { (data) in
            self.actionDone()
        }, failure: self.handleErrors)
    }
    
    func actionDone() {
        _ = navigationController?.popViewController(animated: true)
        return
    }
    
    @IBAction func showProfile(_ sender: Any) {
        if AppData.user.isRecruiter() {
            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobSeekerDetail") as! JobSeekerDetailController
            controller.application = application
            navigationController?.pushViewController(controller, animated: true)
        } else {
            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "ApplicationDetails") as! ApplicationDetailsController
            controller.application = application
            navigationController?.pushViewController(controller, animated: true)
        }
    }
    
    func showInterviewHistories() {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "ApplicationInterviewList") as! ApplicationInterviewListController
        controller.application = application
        navigationController?.pushViewController(controller, animated: true)
    }
}
