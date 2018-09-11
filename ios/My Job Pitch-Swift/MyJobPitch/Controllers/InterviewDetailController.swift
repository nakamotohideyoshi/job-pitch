//
//  TestTableView.swift
//  MyJobPitch
//
//  Created by bb on 9/6/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class InterviewDetailController: MJPController {
    
    @IBOutlet weak var mainView: UIView!
    @IBOutlet weak var mainContentView: UIStackView!
    @IBOutlet weak var tableView: UITableView!
    
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var commentLabel: UILabel!
    @IBOutlet weak var statusLabel: UILabel!
    @IBOutlet weak var dateLabel: UILabel!
    @IBOutlet weak var locationLabel: UILabel!
    @IBOutlet weak var feedbackLabel: UILabel!
    @IBOutlet weak var notesLabel: UILabel!
    
    @IBOutlet weak var acceptBtnView: UIView!
    @IBOutlet weak var completeBtnView: UIView!
    @IBOutlet weak var cancelBtnView: UIView!
    @IBOutlet weak var naviationsView: UIView!
    @IBOutlet weak var historyTitleView: UIView!
    
    var application: Application!
    var interviews: [ApplicationInterview]!
    var interview: ApplicationInterview!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if AppData.user.isRecruiter() {
            let subTitle = String(format: "%@, (%@)", application.job.title, application.job.getBusinessName())
            setTitle(title: "Interview", subTitle: subTitle)
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        reloadData()
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        
        if application != nil {
            var frame = mainView.frame
            frame.size.height = mainContentView.frame.height
            mainView.frame = frame
            tableView.reloadData()
        }
    }
    
    func reloadData() {
        application = (AppData.applications.filter { $0.id == application.id })[0]
        interviews = application.interviews as! [ApplicationInterview]
        interview = (interviews.filter { $0.id == interview.id })[0]
        interviews = interviews.filter { $0.id != interview.id }
        interviews.sort { $0.at < $1.at }
        
        if AppData.user.isRecruiter() {
            AppHelper.loadJobseekerImage(application.jobSeeker, imageView: imageView, completion: nil)
            nameLabel.text = application.jobSeeker.getFullName()
            commentLabel.text = application.jobSeeker.desc
            
        } else {
            AppHelper.loadLogo(image: application.job.getImage(), imageView: imageView, completion: nil)
            nameLabel.text = application.job.title
            commentLabel.text = application.job.getBusinessName()
        }
        
        dateLabel.text = AppHelper.convertDateToString(interview.at)
        
        locationLabel.text = application.job.locationData.placeName
        
        if interview.feedback != "" {
            feedbackLabel.text = interview.feedback
        } else {
            let noneParameters = [NSForegroundColorAttributeName : UIColor.lightGray,
                                   NSFontAttributeName : UIFont.italicSystemFont(ofSize: 15)]
            feedbackLabel.attributedText = NSMutableAttributedString(string: "None", attributes: noneParameters)
        }
        
        notesLabel.text = interview.notes
        
        acceptBtnView.isHidden = false
        completeBtnView.isHidden = false
        cancelBtnView.isHidden = false
        
        feedbackLabel.superview?.isHidden = true
        notesLabel.superview?.isHidden = false
        
        naviationsView.isHidden = false
        
        if interview.status == InterviewStatus.INTERVIEW_PENDING {
            statusLabel.text = "Interview request sent"
        } else if interview.status == InterviewStatus.INTERVIEW_ACCEPTED {
            statusLabel.text = "Interview accepted"
            acceptBtnView.isHidden = true
        } else {
            if interview.status == InterviewStatus.INTERVIEW_COMPLETED {
                statusLabel.text = "This interview is done"
                feedbackLabel.superview?.isHidden = false
            } else if interview.status == InterviewStatus.INTERVIEW_CANCELLED {
                statusLabel.text = "Interview cancelled by " + (AppData.user.isRecruiter() ? "Recruiter" : "Jobseeker")
            }
            acceptBtnView.isHidden = true
            completeBtnView.isHidden = true
            cancelBtnView.isHidden = true
            naviationsView.isHidden = true
            historyTitleView.isHidden = true
            interviews = nil
        }
        
        navigationItem.rightBarButtonItem = nil
        
        if AppData.user.isRecruiter() {
            acceptBtnView.isHidden = true
            if !cancelBtnView.isHidden {
                navigationItem.rightBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav-edit"), style: .plain, target: self, action: #selector(editAction))
            }
        } else {
            completeBtnView.isHidden = true
            notesLabel.superview?.isHidden = true
        }
        
        historyTitleView.isHidden = interviews == nil || interviews.count == 0
    }
    
    @IBAction func appDetailAction(_ sender: Any) {
        if AppData.user.isJobSeeker() {
            let controller = ApplicationDetailsController.instantiate()
            controller.application = application
            controller.onlyView = true
            navigationController?.pushViewController(controller, animated: true)
        } else {
            let controller = JobSeekerDetailController.instantiate()
            controller.application = application
            controller.onlyView = true
            navigationController?.pushViewController(controller, animated: true)
        }
    }
    
    @IBAction func acceptAction(_ sender: Any) {
        PopupController.showYellow("Are you sure you want to accept this interview?", ok: "Ok", okCallback: {
            self.showLoading()
            API.shared().changeInterview(interviewId: self.interview.id, type: "accept", success: { (_) in
                AppData.updateApplication(self.application.id, success: {
                    self.hideLoading()
                    self.reloadData()
                }, failure: self.handleErrors)
            }, failure: self.handleErrors)
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func completeAction(_ sender: Any) {
        let controller = InterviewEditController.instantiate()
        controller.application = application
        controller.interview = interview
        controller.isComplete = true
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    @IBAction func cancelAction(_ sender: Any) {
        PopupController.showYellow("Are you sure you want to cancel this interview?", ok: "Ok", okCallback: {
            self.showLoading()
            API.shared().deleteInterview(interviewId: self.interview.id, success: { (_) in
                AppData.updateApplication(self.application.id, success: {
                    _ = self.navigationController?.popViewController(animated: true)
                }, failure: self.handleErrors)
            }, failure: self.handleErrors)
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    func editAction() {
        let controller = InterviewEditController.instantiate()
        controller.application = application
        controller.interview = interview
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
   
    @IBAction func messagesAction(_ sender: Any) {
        let controller = MessageController0.instantiate()
        controller.application = application
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    static func instantiate() -> InterviewDetailController {
        return AppHelper.instantiate("InterviewDetail") as! InterviewDetailController
    }
}

extension InterviewDetailController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return interviews != nil ? interviews.count : 0
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "InterviewHistoryCell", for: indexPath)
        
        let interview = interviews[indexPath.row]
        var status1 = ""
        if interview.status == InterviewStatus.INTERVIEW_COMPLETED {
            status1 = "Completed"
        } else if interview.status == InterviewStatus.INTERVIEW_CANCELLED {
            status1 = "Cancelled"
        }        
        
        (cell.viewWithTag(1) as! UILabel).text = AppHelper.convertDateToString(interview.at)
        (cell.viewWithTag(2) as! UILabel).text = status1
        
        if indexPath.row < interviews.count - 1 {
            cell.addUnderLine(paddingLeft: 12, paddingRight: 0, color: AppData.greyBorderColor)
        }
        
        return cell
    }
}

extension InterviewDetailController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let controller = InterviewDetailController.instantiate()
        controller.application = application
        controller.interview = interviews[indexPath.row]
        navigationController?.pushViewController(controller, animated: true)
    }
}

