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
    @IBOutlet weak var removeBtnView: UIView!
    @IBOutlet weak var connectBtnView: UIView!
    @IBOutlet weak var messageBtnView: UIView!
    @IBOutlet weak var availableView: UIView!
    @IBOutlet weak var nationalNumberView: UIView!
    @IBOutlet weak var truthfulView: UIView!
    @IBOutlet weak var overviewLabel: UILabel!
    @IBOutlet weak var cvButton: YellowButton!
    
    var resources = Array<JobResourceModel>()
    
    var jobSeeker: JobSeeker!
    var application: Application?
    var chooseDelegate: ChooseDelegate!
    var onlyView = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if application != nil {
            jobSeeker = application?.jobSeeker
        }
        
        if jobSeeker == nil {
            title = "Profile"
            navigationItem.rightBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav-edit"), style: .plain, target: self, action: #selector(editProfile))
            
            onlyView = true

            showLoading()
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
        
        let resource = JobResourceModel()
        let pitch = jobSeeker.getPitch()
        if pitch != nil {
            resource.thumbnail = pitch?.thumbnail
            resource.video = pitch?.video
        } else {
            resource.defaultImage = UIImage(named: "no-img")
        }
        resources.append(resource)
        
        nameLabel.text = jobSeeker.getFullName()
        
        let sex = AppData.getSex(jobSeeker.sex)
        if sex != nil && jobSeeker.sexPublic {
            genderLabel.text = sex?.shortName
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
            
            if jobSeeker.emailPublic {
                emailLabel.text = jobSeeker.email
            } else {
                emailLabel.superview?.isHidden = true
            }
            
            if jobSeeker.mobile != nil && jobSeeker.mobile != "" && jobSeeker.mobilePublic {
                mobileLabel.text = jobSeeker.mobile
            } else {
                emailLabel.superview?.isHidden = true
            }
            
            shortlisted.isOn = (application?.shortlisted)!
            
        } else {
            
            emailLabel.superview?.isHidden = true
            mobileLabel.superview?.isHidden = true
            shortlisted.superview?.isHidden = true
            
        }
        
        if application == nil {
            messageBtnView.isHidden = true
        }
        
        if onlyView {
            removeBtnView.isHidden = true
            connectBtnView.isHidden = true
            messageBtnView.isHidden = true
        }
        
        if jobSeeker.cv == nil {
            cvButton.removeFromSuperview()
        }
        
        overviewLabel.text = jobSeeker.desc
        
        pageControl.numberOfPages = resources.count
        if resources.count < 2 {
            pageControl.isHidden = true
        }
        carousel.bounces = false
        carousel.reloadData()
        
    }
    
    func editProfile() {
        let controller = storyboard?.instantiateViewController(withIdentifier: "JobSeekerProfile") as! JobSeekerProfileController
        controller.saveComplete = { () in
            SideMenuController.pushController(id: "view_profile")
        }
        let navController = UINavigationController(rootViewController: controller)
        present(navController, animated: true, completion: nil)
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
            self.chooseDelegate?.apply(callback: {
                _ = self.navigationController?.popViewController(animated: true)
            })
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func messagesAction(_ sender: Any) {
        let controller = MessageController0.instantiate()
        controller.application = application
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    @IBAction func removeAction(_ sender: Any) {
        let message = application == nil ? "Are you sure you want to delete this talent?" : "Are you sure you want to delete this application?"
        PopupController.showYellow(message, ok: "Delete", okCallback: {
            _ = self.navigationController?.popViewController(animated: true)
            self.chooseDelegate?.remove()
        }, cancel: "Cancel", cancelCallback: nil)
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
        //create new view if no view is available for recycling
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

