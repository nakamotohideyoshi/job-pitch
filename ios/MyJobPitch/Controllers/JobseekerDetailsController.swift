//
//  JobseekerDetailsController.swift
//  MyJobPitch
//
//  Created by dev on 12/23/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import AVFoundation
import AVKit

class JobseekerDetailsController: MJPController {
    
    @IBOutlet weak var mainView: UIStackView!
    @IBOutlet weak var tableView: UITableView!
    
    @IBOutlet weak var carousel: iCarousel!
    @IBOutlet weak var pageControl: UIPageControl!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var genderLabel: UILabel!
    @IBOutlet weak var ageLabel: UILabel!
    @IBOutlet weak var emailLabel: UILabel!
    @IBOutlet weak var mobileLabel: UILabel!
    @IBOutlet weak var shortlisted: UISwitch!
    @IBOutlet weak var shortlistIndicator: UIActivityIndicatorView!
    @IBOutlet weak var connectBtnView: UIView!
    @IBOutlet weak var removeBtnView: UIView!
    @IBOutlet weak var arrangeBtnView: UIView!
    @IBOutlet weak var interviewInfo: InterviewView!
    @IBOutlet weak var messageBtnView: UIView!
    @IBOutlet weak var badge: BadgeIcon!
    @IBOutlet weak var availableView: UIView!
    @IBOutlet weak var nationalNumberView: UIView!
    @IBOutlet weak var truthfulView: UIView!
    @IBOutlet weak var overviewLabel: UILabel!
    @IBOutlet weak var cvButton: YellowButton!
    @IBOutlet weak var historyTitleView: UIView!
    
    public var jobseeker: Jobseeker!
    public var application: Application!
    public var job: Job!
    public var viewMode = false
    public var removeCallback: (() -> Void)?
    public var connectCallback: (() -> Void)?
    
    var interview: Interview!
    var interviews = [Interview]()
    var isProfile = false
    
    var resources = [MediaModel]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if application == nil && jobseeker == nil {
            
            title = "Profile"
            navigationItem.rightBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav-edit"), style: .plain, target: self, action: #selector(editProfile))
            
            isProfile = true
            jobseeker = AppData.jobseeker
        }
        
        loadData()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        AppData.appsUpdateCallback = {
            self.loadData()
        }
        
        if jobseeker != nil || application != nil {
            loadData()
        }
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        AppData.appsUpdateCallback = nil
    }
    
    func loadData() {
        
        if application != nil {
            application = (AppData.applications.filter { $0.id == application.id })[0]
            interview = application?.getInterview()
            interviews = (application.interviews as! [Interview]).filter { $0.id != interview?.id }
            jobseeker = application?.jobseeker
            
            shortlisted.isOn = application.shortlisted
            
            let newMsgs = application.getNewMessageCount()
            badge.text = "\(newMsgs)"
            badge.isHidden = newMsgs == 0
        } else {
            interview = nil
        }
        
        resources.removeAll()
        if let pitch = jobseeker.getPitch() {            
            let resource = MediaModel()
            resource.thumbnail = pitch.thumbnail
            resource.video = pitch.video
            resources.append(resource)
        }
        
        let resource = MediaModel()
        resource.thumbnail = jobseeker?.profileThumb
        resource.image = jobseeker?.profileImage
        resource.defaultImage = UIImage(named: "avatar")
        resource.isCircleView = true
        resources.append(resource)
        
        nameLabel.text = jobseeker.getFullName()
        
        if jobseeker.sex != nil && (jobseeker.sexPublic || isProfile) {
            genderLabel.text = AppData.getNameByID(AppData.sexes, id: jobseeker.sex) + (!jobseeker.sexPublic ? " (private)" : "")
            genderLabel.superview?.isHidden = false
        } else {
            genderLabel.superview?.isHidden = true
        }
        
        if jobseeker.age != nil && (jobseeker.agePublic || isProfile) {
            ageLabel.text = jobseeker.age.stringValue + (!jobseeker.agePublic ? " (private)" : "")
            ageLabel.superview?.isHidden = false
        } else {
            ageLabel.superview?.isHidden = true
        }
        
        if jobseeker.email != nil && ((jobseeker.emailPublic && application != nil) || isProfile) {
            emailLabel.text = jobseeker.email + (!jobseeker.emailPublic ? " (private)" : "")
            emailLabel.superview?.isHidden = false
        } else {
            emailLabel.superview?.isHidden = true
        }
        
        if jobseeker.mobile != nil && jobseeker.mobile != "" && ((jobseeker.mobilePublic && application != nil) || isProfile) {
            mobileLabel.text = jobseeker.mobile + (!jobseeker.mobilePublic ? " (private)" : "")
            mobileLabel.superview?.isHidden = false
        } else {
            mobileLabel.superview?.isHidden = true
        }
        
        interviewInfo.superview?.isHidden = viewMode || interview == nil
        if (!(interviewInfo.superview?.isHidden)!) {
            interviewInfo.interview = interview
            interviewInfo.application = application
            interviewInfo.completeCallback = completeAction
            interviewInfo.cancelCallback = cancelInterview
        }
        
        availableView.isHidden = !jobseeker.hasReferences
        nationalNumberView.isHidden = !jobseeker.has_national_insurance_number
        truthfulView.isHidden = !jobseeker.truthConfirmation
        
        // contact info
        
        let connected = application?.status == ApplicationStatus.APPLICATION_ESTABLISHED_ID
        let external = application != nil && application.messages.count == 0
        
        shortlisted.superview?.isHidden = viewMode || !connected
        connectBtnView.isHidden = viewMode || isProfile || (application != nil && application?.status != ApplicationStatus.APPLICATION_CREATED_ID)
        removeBtnView.isHidden = viewMode || isProfile || (application != nil && application?.status == ApplicationStatus.APPLICATION_DELETED_ID)
        arrangeBtnView.isHidden = viewMode || isProfile || !connected || interview != nil || external
        messageBtnView.isHidden = viewMode || isProfile || !connected || external
        
        overviewLabel.text = jobseeker.desc
        cvButton.isHidden = jobseeker.cv == nil
        
        pageControl.numberOfPages = resources.count
        pageControl.isHidden = resources.count <= 1
        
        carousel.bounces = false
        carousel.reloadData()
        
        historyTitleView.isHidden = interviews.count == 0
        
        mainView.layoutIfNeeded()
        mainView.sizeToFit()
        mainView.superview?.frame.size.height = mainView.frame.height
        
        tableView.reloadData()
    }
    
    func editProfile() {
        let controller = JobseekerProfileController.instantiate()
        controller.isModal = true
        controller.saveComplete = {
            self.jobseeker = AppData.jobseeker
            self.loadData()
        }
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    func updateApplication() {
        AppData.getApplication(application.id) { (_, error) in
            if error == nil {
                self.popController()
            } else {
                self.handleError(error)
            }
        }
    }
    
    @IBAction func viewCVAction(_ sender: Any) {
        let url = URL(string: jobseeker.cv)!
        if #available(iOS 10.0, *) {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        } else {
            UIApplication.shared.openURL(url)
        }
    }
    
    @IBAction func shortlistChanged(_ sender: Any) {
        
        application?.shortlisted = shortlisted.isOn
        
        let data = ApplicationShortlistUpdate()
        data.id = application?.id
        data.shortlisted = (application?.shortlisted)!
        
        shortlisted.isHidden = true
        shortlistIndicator.isHidden = false
        API.shared().updateApplicationShortlist(data) { (_, error) in
            if error == nil {
                self.shortlisted.isHidden = false
                self.shortlistIndicator.isHidden = true
            } else {
                self.handleError(error)
            }
        }
    }
    
    @IBAction func connectAction(_ sender: Any) {
        
        let message = application == nil ? "Are you sure you want to connect this talent?" : "Are you sure you want to connect this application?"
        PopupController.showGreen(message, ok: "Connect (1 credit)", okCallback: {
            
            self.showLoading()
            
            if self.application == nil {
                
                let application = ApplicationForCreation()
                application.job = self.job?.id
                application.jobseeker = self.jobseeker.id
                
                API.shared().createApplication(application) { (result, error) in
                    if result != nil {
                        AppData.getApplication((result as! Application).id, complete: nil)
                        self.popController()
                        self.connectCallback?()
                    } else {
                        self.handleError(error)
                    }
                }
                
            } else {
                
                let data = ApplicationStatusUpdate()
                data.id = self.application.id
                data.status = ApplicationStatus.APPLICATION_ESTABLISHED_ID
                
                API.shared().updateApplicationStatus(data) { (_, error) in
                    if error == nil {
                        self.updateApplication()
                    } else {
                        self.handleError(error)
                    }
                }
            }
            
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func removeAction(_ sender: Any) {
        
        let message = application == nil ? "Are you sure you want to delete this talent?" : "Are you sure you want to delete this application?"
        PopupController.showYellow(message, ok: "Delete", okCallback: {
            
            self.showLoading()

            if self.application == nil {
                let request = ExclusionJobseeker()
                request.job = self.job.id
                request.jobseeker = self.jobseeker.id
                
                API.shared().ExclusionJobseeker(request) { (_, error) in
                    if error == nil {
                        self.removeCallback?()
                    } else {
                        self.handleError(error)
                    }
                }
            } else {
                API.shared().deleteApplication(self.application.id) { error in
                    if error == nil {
                        self.updateApplication()
                    } else {
                        self.handleError(error)
                    }
                }
            }
            
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func arrangeAction(_ sender: Any) {
        let controller = InterviewEditController.instantiate()
        controller.application = application
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    func completeAction() {
        let controller = InterviewEditController.instantiate()
        controller.application = application
        controller.interview = interview
        controller.isComplete = true
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    func cancelInterview() {
        PopupController.showYellow("Are you sure you want to cancel this interview?", ok: "Ok", okCallback: {
            self.showLoading()
            API.shared().deleteInterview(self.interview.id) { error in
                if error == nil {
                    self.updateApplication()
                } else {
                    self.handleError(error)
                }
            }
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func messagesAction(_ sender: Any) {
        let controller = MessageController0.instantiate()
        controller.application = application
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    func popController() {
        _ = self.navigationController?.popViewController(animated: true)
    }
    static func instantiate() -> JobseekerDetailsController {
        return AppHelper.instantiate("JobseekerDetails") as! JobseekerDetailsController
    }
}

extension JobseekerDetailsController: iCarouselDataSource {
    
    func numberOfItems(in carousel: iCarousel) -> Int {
        return resources.count
    }
    
    func carousel(_ carousel: iCarousel, viewForItemAt index: Int, reusing view: UIView?) -> UIView {
        
        var mediaView: MediaView!
        if view == nil {
            mediaView = MediaView(frame: carousel.bounds)
            mediaView.controller = self
        } else {
            mediaView = view as! MediaView
        }
        
        mediaView.model = resources[index]
        return mediaView
    }
}

extension JobseekerDetailsController: iCarouselDelegate {
    func carouselCurrentItemIndexDidChange(_ carousel: iCarousel) {
        pageControl.currentPage = carousel.currentItemIndex
    }
}

extension JobseekerDetailsController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return interviews.count
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
        
        (cell.viewWithTag(1) as! UILabel).text = AppHelper.dateToShortString(interview.at)
        (cell.viewWithTag(2) as! UILabel).text = status1
        
        if indexPath.row < interviews.count - 1 {
            cell.drawUnderline()
        }
        
        return cell
    }
}

extension JobseekerDetailsController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let controller = InterviewDetailsController.instantiate()
        controller.application = application
        controller.interviewId = interviews[indexPath.row].id
        navigationController?.pushViewController(controller, animated: true)
    }
}

