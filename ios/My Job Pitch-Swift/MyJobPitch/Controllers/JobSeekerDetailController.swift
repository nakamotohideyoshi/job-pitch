//
//  JobSeekerDetailController.swift
//  MyJobPitch
//
//  Created by dev on 12/23/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import AVFoundation
import AVKit

class JobSeekerDetailController: MJPController {
    
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
    @IBOutlet weak var messageBtnView: UIView!
    @IBOutlet weak var availableView: UIView!
    @IBOutlet weak var nationalNumberView: UIView!
    @IBOutlet weak var truthfulView: UIView!
    @IBOutlet weak var overviewLabel: UILabel!
    @IBOutlet weak var cvButton: YellowButton!
    
    var jobSeeker: JobSeeker!
    var application: Application!
    var interview: ApplicationInterview!
    var preInterviews: [ApplicationInterview]!
    var isHideMessages = false
    var viewMode = false
    var isProfile = false
    
    var controlDelegate: ControlDelegate!
    
    var resources = [MediaModel]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if application == nil && jobSeeker == nil {
            
            title = "Profile"
            navigationItem.rightBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav-edit"), style: .plain, target: self, action: #selector(editProfile))
            
            isProfile = true

            self.showLoading()
            API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
                self.hideLoading()
                self.jobSeeker = data as! JobSeeker
                self.loadData()
            }, failure: self.handleErrors)
            
        } else {
            loadData()
        }
    }
    
    func loadData() {
        
        if application != nil {
            jobSeeker = application?.jobSeeker
        }
        interview = AppHelper.getInterview(application)
        
        resources.removeAll()
        if let pitch = jobSeeker.getPitch() {            
            let resource = MediaModel()
            resource.thumbnail = pitch.thumbnail
            resource.video = pitch.video
            resources.append(resource)
        }
        
        let resource = MediaModel()
        resource.thumbnail = jobSeeker?.profileThumb
        resource.image = jobSeeker?.profileImage
        resource.defaultImage = UIImage(named: "avatar")
        resource.isCircleView = true
        resources.append(resource)
        
        nameLabel.text = jobSeeker.getFullName()
        
        let sex = AppData.getSex(jobSeeker.sex)
        if sex != nil && (jobSeeker.sexPublic || isProfile) {
            genderLabel.text = (sex?.name)! + (!jobSeeker.sexPublic ? " (private)" : "")
            genderLabel.superview?.isHidden = false
        } else {
            genderLabel.superview?.isHidden = true
        }
        
        if jobSeeker.age != nil && (jobSeeker.agePublic || isProfile) {
            ageLabel.text = jobSeeker.age.stringValue + (!jobSeeker.agePublic ? " (private)" : "")
            ageLabel.superview?.isHidden = false
        } else {
            ageLabel.superview?.isHidden = true
        }
        
        if jobSeeker.email != nil && (jobSeeker.emailPublic || isProfile) {
            emailLabel.text = jobSeeker.email + (!jobSeeker.emailPublic ? " (private)" : "")
            emailLabel.superview?.isHidden = false
        } else {
            emailLabel.superview?.isHidden = true
        }
        
        if jobSeeker.mobile != nil && (jobSeeker.mobilePublic || isProfile) {
            mobileLabel.text = jobSeeker.mobile + (!jobSeeker.mobilePublic ? " (private)" : "")
            mobileLabel.superview?.isHidden = false
        } else {
            mobileLabel.superview?.isHidden = true
        }
        
        availableView.isHidden = !jobSeeker.hasReferences
        nationalNumberView.isHidden = !jobSeeker.has_national_insurance_number
        truthfulView.isHidden = !jobSeeker.truthConfirmation
        
        // contact info
        
        let connected = application?.status == ApplicationStatus.APPLICATION_ESTABLISHED_ID
        
        shortlisted.isOn = connected && application.shortlisted
        shortlisted.superview?.isHidden = !connected
        emailLabel.superview?.isHidden = !connected && !isProfile
        mobileLabel.superview?.isHidden = !connected && !isProfile
        connectBtnView.isHidden = viewMode || isProfile || connected
        removeBtnView.isHidden = viewMode || isProfile
        arrangeBtnView.isHidden = viewMode || isProfile || !connected || interview != nil
        messageBtnView.isHidden = viewMode || isProfile || isHideMessages || !connected
        
        overviewLabel.text = jobSeeker.desc
        
        cvButton.isHidden = jobSeeker.cv == nil
        
        pageControl.numberOfPages = resources.count
        pageControl.isHidden = resources.count <= 1
        
        carousel.bounces = false
        carousel.reloadData()
    }
    
    func editProfile() {
        let controller = JobSeekerProfileController.instantiate()
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    func updateApplication() {
        AppData.updateApplication(application.id, success: { (_) in
            self.popController()
        }, failure: self.handleErrors)
    }
    
    @IBAction func viewCVAction(_ sender: Any) {
        let url = URL(string: jobSeeker.cv)!
        if #available(iOS 10.0, *) {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        } else {
            UIApplication.shared.openURL(url)
        }
    }
    
    @IBAction func shortlistChanged(_ sender: Any) {
        
        application?.shortlisted = shortlisted.isOn
        
        let update = ApplicationShortlistUpdate()
        update.id = application?.id
        update.shortlisted = (application?.shortlisted)!
        
        shortlisted.isHidden = true
        shortlistIndicator.isHidden = false
        API.shared().updateApplicationShortlist(update: update, success: { (_) in
            self.shortlisted.isHidden = false
            self.shortlistIndicator.isHidden = true
        }, failure: self.handleErrors)
    }
    
    @IBAction func connectAction(_ sender: Any) {
        
        let message = application == nil ? "Are you sure you want to connect this talent?" : "Are you sure you want to connect this application?"
        PopupController.showGreen(message, ok: "Connect (1 credit)", okCallback: {
            
            self.showLoading()
            
            if self.application == nil {
                
                self.controlDelegate.apply(success: { (_) in
                    self.popController()
                }, failure: nil)
                
            } else {
                
                let update = ApplicationStatusUpdate()
                update.id = self.application.id
                update.status = ApplicationStatus.APPLICATION_ESTABLISHED_ID
                
                API.shared().updateApplicationStatus(update: update, success: { (data) in
                    self.updateApplication()
                }) { (message, errors) in
                    self.hideLoading()
                    if errors?["NO_TOKENS"] != nil {
                        PopupController.showGray("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.", ok: "Ok")
                    } else {
                        self.handleErrors(message: message, errors: errors)
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
                self.controlDelegate.remove(success: { (_) in
                    self.popController()
                }, failure: nil)
            } else {
                API.shared().deleteApplication(id: self.application.id, success: {
                    self.updateApplication()
                }, failure: self.handleErrors)
            }
            
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func arrangeAction(_ sender: Any) {
        let controller = InterviewEditController.instantiate()
        controller.application = application
        controller.saveComplete = { (application) in
            self.application = application
            self.loadData()
        }
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    @IBAction func messagesAction(_ sender: Any) {
        let controller = MessageController0.instantiate()
        controller.application = application
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    func popController() {
        _ = self.navigationController?.popViewController(animated: true)
    }
    static func instantiate() -> JobSeekerDetailController {
        return AppHelper.instantiate("JobSeekerDetails") as! JobSeekerDetailController
    }
}

extension JobSeekerDetailController: iCarouselDataSource {
    
    func numberOfItems(in carousel: iCarousel) -> Int {
        return resources.count
    }
    
    func carousel(_ carousel: iCarousel, viewForItemAt index: Int, reusing view: UIView?) -> UIView {
        
        var mediaView: MediaView!
        if view == nil {
            mediaView = MediaView.instantiate(carousel.bounds)
            mediaView.controller = self
        } else {
            mediaView = view as! MediaView
        }
        
        mediaView.model = resources[index]
        return mediaView
    }
}

extension JobSeekerDetailController: iCarouselDelegate {
    func carouselCurrentItemIndexDidChange(_ carousel: iCarousel) {
        pageControl.currentPage = carousel.currentItemIndex
    }
}

