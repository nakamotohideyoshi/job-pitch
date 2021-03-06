//
//  InterviewDetailController.swift
//  MyJobPitch
//
//  Created by bb on 9/6/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class InterviewDetailsController: MJPController {
    
    @IBOutlet weak var mainView: UIStackView!
    @IBOutlet weak var tableView: UITableView!
    
    @IBOutlet weak var infoView: AppInfoSmallView!
    @IBOutlet weak var interviewInfo: InterviewView!
    @IBOutlet weak var feedbackLabel: UILabel!
    @IBOutlet weak var notesLabel: UILabel!
    @IBOutlet weak var naviationsView: UIView!
    @IBOutlet weak var badge: BadgeIcon!
    @IBOutlet weak var historyTitleView: UIView!
    
    public var application: Application!
    public var interviewId: NSNumber!
    
    var interview: Interview!
    var interviews = [Interview]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if AppData.user.isRecruiter() {
            let subTitle = String(format: "%@, (%@)", application.job.title, application.job.getBusinessName())
            setTitle(title: NSLocalizedString("Interview", comment: ""), subTitle: subTitle)
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        AppData.appsUpdateCallback = {
            self.reloadData()
        }
        
        reloadData()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        AppData.appsUpdateCallback = nil
    }
    
    func reloadData() {
        let viewMode = interviewId != nil
        
        application = (AppData.applications.filter { $0.id == application.id })[0]
        let appInterviews = application.interviews as! [Interview]
        
        infoView.isHidden = viewMode
        if !viewMode {
            
            interview = application.getInterview()
            if interview == nil {
                interview = application.interviews.lastObject as! Interview
            }
            
            interviews = appInterviews.filter { $0.id != interview?.id }

            if AppData.user.isJobseeker() {
                infoView.job = application.job
                infoView.touch = {
                    let controller = ApplicationDetailsController.instantiate()
                    controller.application = self.application
                    controller.viewMode = true
                    self.navigationController?.pushViewController(controller, animated: true)
                }
            } else {
                infoView.jobseeker = application.jobseeker
                infoView.touch = {
                    let controller = JobseekerDetailsController.instantiate()
                    controller.application = self.application
                    controller.viewMode = true
                    self.navigationController?.pushViewController(controller, animated: true)
                }
            }
        } else {
            interview = (appInterviews.filter { $0.id == interviewId })[0]
            interviews.removeAll()
        }
        
        interviewInfo.interview = interview
        interviewInfo.application = application
        interviewInfo.acceptCallback = viewMode ? nil : acceptAction
        interviewInfo.completeCallback = viewMode ? nil : completeAction
        interviewInfo.cancelCallback = viewMode ? nil : cancelAction
        
        let pending = interview.status == InterviewStatus.INTERVIEW_PENDING
        let accepted = interview.status == InterviewStatus.INTERVIEW_ACCEPTED
        let completed = interview.status == InterviewStatus.INTERVIEW_COMPLETED
        
        notesLabel.text = interview.notes
        if interview.feedback == "" {
            let noneParameters = [NSForegroundColorAttributeName : UIColor.lightGray,
                                   NSFontAttributeName : UIFont.italicSystemFont(ofSize: 15)]
            feedbackLabel.attributedText = NSMutableAttributedString(string: NSLocalizedString("None", comment: ""), attributes: noneParameters)
        } else {
            feedbackLabel.attributedText = nil
            feedbackLabel.text = interview.feedback
        }
        
        let newMsgs = application.getNewMessageCount()
        badge.text = "\(newMsgs)"
        badge.isHidden = newMsgs == 0
        
        notesLabel.superview?.isHidden = AppData.user.isJobseeker()
        feedbackLabel.superview?.isHidden = !completed
        naviationsView.isHidden = viewMode
        historyTitleView.isHidden = viewMode || interviews.count == 0
        
        if AppData.user.isRecruiter() && !viewMode && (pending || accepted) {
            navigationItem.rightBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav-edit"), style: .plain, target: self, action: #selector(editAction))
        } else {
            navigationItem.rightBarButtonItem = nil
        }
        
        historyTitleView.isHidden = viewMode || interviews.count == 0
     
        mainView.layoutIfNeeded()
        mainView.sizeToFit()
        mainView.superview?.frame.size.height = mainView.frame.height
        
        tableView.reloadData()
    }
    
    func updateApplication() {
        AppData.getApplication(application.id) { (_, error) in
            if error == nil {
                self.hideLoading()
                self.reloadData()
            } else {
                self.handleError(error)
            }
        }
    }
    
    func acceptAction() {
        PopupController.showYellow(NSLocalizedString("Are you sure you want to accept this interview?", comment: ""),
                                   ok: NSLocalizedString("Ok", comment: ""), okCallback: {
            self.showLoading()
            let interviewForSave = InterviewForSave()
            interviewForSave.id = self.interview?.id
            API.shared().changeInterview(interviewForSave, type: "accept") { (_, error) in
                if error == nil {
                    self.updateApplication()
                } else {
                    self.handleError(error)
                }
            }
        }, cancel: NSLocalizedString("Cancel", comment: ""), cancelCallback: nil)
    }
    
    func cancelAction() {
        PopupController.showYellow(NSLocalizedString("Are you sure you want to cancel this interview?", comment: ""),
                                   ok: NSLocalizedString("Ok", comment: ""), okCallback: {
            self.showLoading()
            API.shared().deleteInterview(self.interview.id) { (error) in
                if error == nil {
                    self.updateApplication()
                } else {
                    self.handleError(error)
                }
            }
        }, cancel: NSLocalizedString("Cancel", comment: ""), cancelCallback: nil)
    }
    
    func completeAction() {
        let controller = InterviewEditController.instantiate()
        controller.application = application
        controller.interview = interview
        controller.isComplete = true
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
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
    
    func popController() {
        _ = navigationController?.popViewController(animated: true)
    }
    
    static func instantiate() -> InterviewDetailsController {
        return AppHelper.instantiate("InterviewDetails") as! InterviewDetailsController
    }
}

extension InterviewDetailsController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return interviews.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "InterviewHistoryCell", for: indexPath)
        
        let interview = interviews[indexPath.row]
        var status1 = ""
        if interview.status == InterviewStatus.INTERVIEW_COMPLETED {
            status1 = NSLocalizedString("Completed", comment: "")
        } else if interview.status == InterviewStatus.INTERVIEW_CANCELLED {
            status1 = NSLocalizedString("Cancelled", comment: "")
        }        
        
        (cell.viewWithTag(1) as! UILabel).text = AppHelper.dateToShortString(interview.at)
        (cell.viewWithTag(2) as! UILabel).text = status1
        
        if indexPath.row < interviews.count - 1 {
            cell.drawUnderline()
        }
        
        return cell
    }
}

extension InterviewDetailsController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let controller = InterviewDetailsController.instantiate()
        controller.application = application
        controller.interviewId = interviews[indexPath.row].id
        navigationController?.pushViewController(controller, animated: true)
    }
}

