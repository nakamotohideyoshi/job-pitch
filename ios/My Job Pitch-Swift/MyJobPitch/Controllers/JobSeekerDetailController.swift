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
    @IBOutlet weak var messageBtnView: UIView!
    @IBOutlet weak var availableView: UIView!
    @IBOutlet weak var nationalNumberView: UIView!
    @IBOutlet weak var truthfulView: UIView!
    @IBOutlet weak var overviewLabel: UILabel!
    @IBOutlet weak var cvButton: YellowButton!
    
    var jobSeeker: JobSeeker!
    var application: Application!
    var readOnly = false
    var isHideMessages = false
    
    var resources = Array<JobResourceModel>()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if application != nil {
            jobSeeker = application?.jobSeeker
        }
        
        if jobSeeker == nil {
            
            title = "Profile"
            navigationItem.rightBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav-edit"), style: .plain, target: self, action: #selector(editProfile))
            
            readOnly = true

            self.showLoading()
            API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
                
                self.hideLoading()
                self.jobSeeker = data as! JobSeeker
                self.load()
                
            }, failure: self.handleErrors)
            
        } else {
            load()
        }
    }
    
    func load() {
        
        if let pitch = jobSeeker.getPitch() {
            
            let resource = JobResourceModel()
            resource.thumbnail = pitch.thumbnail
            resource.video = pitch.video
            resources.append(resource)
        }
        
        let resource = JobResourceModel()
        resource.thumbnail = jobSeeker.profileThumb
        resource.image = jobSeeker?.profileImage
        var avatar = "avatar"
        if jobSeeker.sexPublic {
            if let sex = AppData.getSex(jobSeeker.sex) {
                avatar = String(format: "avatar_%@", sex.name)
            }
        }
        resource.defaultImage = UIImage(named: avatar)
        resources.append(resource)
        
        nameLabel.text = jobSeeker.getFullName()
        
        let sex = AppData.getSex(jobSeeker.sex)
        if sex != nil && jobSeeker.sexPublic {
            genderLabel.text = sex?.name
        } else {
            genderLabel.superview?.isHidden = true
        }
        
        if jobSeeker.age != nil && jobSeeker.agePublic {
            ageLabel.text = jobSeeker.age.stringValue
        } else {
            ageLabel.superview?.isHidden = true
        }
        
        if !jobSeeker.hasReferences {
            availableView.isHidden = true
        }
        if !jobSeeker.has_national_insurance_number || jobSeeker.national_insurance_number == nil {
            nationalNumberView.isHidden = true
        }
        if !jobSeeker.truthConfirmation {
            truthfulView.isHidden = true
        }
        
        // contact info
        
        if application?.status == ApplicationStatus.APPLICATION_ESTABLISHED_ID {
            
            if jobSeeker.email != nil && jobSeeker.emailPublic {
                emailLabel.text = jobSeeker.email
            } else {
                emailLabel.superview?.isHidden = true
            }
            
            if jobSeeker.mobile != nil && jobSeeker.mobilePublic {
                mobileLabel.text = jobSeeker.mobile
            } else {
                mobileLabel.superview?.isHidden = true
            }
            
            shortlisted.isOn = (application?.shortlisted)!
            
            connectBtnView.isHidden = true
            
        } else {
            
            emailLabel.superview?.isHidden = true
            mobileLabel.superview?.isHidden = true
            shortlisted.superview?.isHidden = true
           
            messageBtnView.isHidden = true
        }
        
        if readOnly {
            connectBtnView.isHidden = true
            removeBtnView.isHidden = true
            messageBtnView.isHidden = true
        } else if isHideMessages {
            messageBtnView.isHidden = true
        }
        
        if jobSeeker.cv == nil {
            cvButton.removeFromSuperview()
        }
        
        overviewLabel.text = jobSeeker.desc
        
        pageControl.numberOfPages = resources.count
        if resources.count <= 1 {
            pageControl.isHidden = true
        }

        carousel.bounces = false
        carousel.reloadData()
    }
    
    func editProfile() {
        
        let controller = JobSeekerProfileController.instantiate()
        controller.saveComplete = { () in
            SideMenuController.pushController(id: "view_profile")
        }
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    func updateApplication(_ applicationId: NSNumber) {
        
        AppData.updateApplication(application.id, success: { (_) in
            AppHelper.hideLoading()
            self.closeAction()
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
            
            if self.application != nil {
                
                AppHelper.showLoading("")
                
                let update = ApplicationStatusUpdate()
                update.id = self.application.id
                update.status = ApplicationStatus.APPLICATION_ESTABLISHED_ID
                
                API.shared().updateApplicationStatus(update: update, success: { (data) in
                    self.updateApplication(self.application.id)
                }) { (message, errors) in
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
            
            AppHelper.showLoading("")
            
            API.shared().deleteApplication(id: self.application.id, success: {
                self.updateApplication(self.application.id)
            }, failure: self.handleErrors)

        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func messagesAction(_ sender: Any) {
        
        let controller = MessageController0.instantiate()
        controller.application = application
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    func closeAction() {
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
        
        var jobResource: JobResource!
        if view == nil {
            jobResource = JobResource.instanceFromNib(carousel.bounds)
            jobResource.controller = self
        } else {
            jobResource = view as! JobResource
        }
        
        jobResource.model = resources[index]
        return jobResource
    }
}

extension JobSeekerDetailController: iCarouselDelegate {

    func carouselCurrentItemIndexDidChange(_ carousel: iCarousel) {
        pageControl.currentPage = carousel.currentItemIndex
    }
}

