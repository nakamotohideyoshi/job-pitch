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

    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var attributesLabel: UILabel!
    @IBOutlet weak var descLabel: UILabel!
    @IBOutlet weak var cvButton: RoundButton!
    @IBOutlet weak var contactView: UIView!
    @IBOutlet weak var contactDetailLabel: UILabel!
    @IBOutlet weak var applyButton: RoundButton!
    @IBOutlet weak var shortlisted: UISwitch!
    @IBOutlet weak var nationalNumberView: UIView!
    @IBOutlet weak var availableView: UIView!
    @IBOutlet weak var truthfulView: UIView!
    @IBOutlet weak var pitchPlayButton: UIButton!
    @IBOutlet weak var buttonContainer: UIView!
    
    @IBOutlet weak var connectHelpButton: UIButton!
    
    @IBOutlet weak var shortlistSwitch: UISwitch!
    @IBOutlet weak var shortlistIndicator: UIActivityIndicatorView!
    
    var jobSeeker: JobSeeker!
    var job: Job!
    var application: Application!
    var chooseDelegate: ChooseDelegate!
    var onlyView = false
    
    var isConnected = false
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        if application != nil {
            jobSeeker = application.jobSeeker
            isConnected = application.status == AppData.getApplicationStatusByName(ApplicationStatus.APPLICATION_ESTABLISHED).id
        }
        
        load()
        
    }
    
    func load() {
    
        let pitch = jobSeeker.getPitch()
        if pitch != nil {
            AppHelper.loadImageURL(imageUrl: (pitch?.thumbnail)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "no-img")
        }
        
        nameLabel.text = jobSeeker.getFullName()
        
        let sex = AppData.getSex(jobSeeker.sex)
        if sex != nil && jobSeeker.sexPublic && jobSeeker.age != nil && jobSeeker.agePublic {
            attributesLabel.text = String(format: "%@ %@", jobSeeker.age, (sex?.shortName)!)
        } else if sex != nil && jobSeeker.sexPublic {
            attributesLabel.text = sex?.shortName
        } else if jobSeeker.age != nil && jobSeeker.agePublic {
            attributesLabel.text = jobSeeker.age.stringValue
        } else {
            attributesLabel.text = ""
        }
        
        descLabel.text = jobSeeker.desc
        
        if jobSeeker.getPitch() == nil {
            pitchPlayButton.isHidden = true
        }
        
        if !jobSeeker.hasReferences {
            availableView.removeFromSuperview()
        }
        if !jobSeeker.truthConfirmation {
            truthfulView.removeFromSuperview()
        }

        
        // contact info
        
        if isConnected {
            
            if jobSeeker.national_insurance_number.isEmpty {
                nationalNumberView.removeFromSuperview()
            }
            
            if jobSeeker.cv == nil {
                cvButton.removeFromSuperview()
            }
            
            let contactDetails = NSMutableArray()
            if jobSeeker.emailPublic {
                contactDetails.add(jobSeeker.email)
            }
            if jobSeeker.mobile != nil && jobSeeker.mobile != "" && jobSeeker.mobilePublic {
                contactDetails.add(jobSeeker.mobile)
            }
            if contactDetails.count > 0 {
                contactDetailLabel.text = contactDetails.componentsJoined(by: "\n")
            } else {
                contactDetailLabel.text = "No contact details supplied."
            }
            
            shortlisted.isOn = application.shortlisted
            
            if onlyView {
                buttonContainer.removeFromSuperview()
            }
            
            connectHelpButton.removeFromSuperview()
            
        } else {
            
            nationalNumberView.removeFromSuperview()
            
            cvButton.removeFromSuperview()
            contactView.removeFromSuperview()
            applyButton.setTitle("Connect", for: .normal)
            
            let j = job != nil ? job : application.job
            let creditCount = j?.locationData.businessData.tokens as! Int
            let credits = creditCount > 1 ? "Credits" : "Credit"
            applyButton.setTitle(String(format: "Connect  (%d %@)", creditCount, credits), for: .normal)
            
        }
        
    }
    
    @IBAction func videoPitchAction(_ sender: Any) {
        if let video = jobSeeker.getPitch()?.video {
            let player = AVPlayer(url: URL(string: video)!)
            let playerController = AVPlayerViewController();
            playerController.player = player
            present(playerController, animated: true, completion: nil)
        }
    }
    
    @IBAction func viewCVAction(_ sender: Any) {
        UIApplication.shared.open(URL(string: jobSeeker.cv)!, options: [:], completionHandler: nil)
    }
    
    @IBAction func shortlistedChanged(_ sender: Any) {
        
        application.shortlisted = shortlisted.isOn
        
        let update = ApplicationShortlistUpdate()
        update.id = application.id
        update.shortlisted = application.shortlisted
        
        shortlistSwitch.isHidden = true
        shortlistIndicator.isHidden = false
        API.shared().updateApplicationShortlist(update: update, success: { (_) in
            self.shortlistSwitch.isHidden = false
            self.shortlistIndicator.isHidden = true
        }, failure: self.handleErrors)
        
    }
    
    @IBAction func connectHelpAction(_ sender: Any) {
        PopupController.showGray("Hit connect to view full talent detail and CV (if available). Talent will be added to your connection list where you can shortlist them, and start messaging.\n(1 credit/connection)", ok: "Close")
    }
    
    
    @IBAction func applyAction(_ sender: Any) {
        if isConnected {
            MessageController0.showModal(application: application)
        } else {
            let message = application == nil ? "Are you sure you want to connect this talent?" : "Are you sure you want to connect this application?"
            PopupController.showGreen(message, ok: "Connect", okCallback: {
                self.showLoading()
                self.chooseDelegate?.apply(callback: {
                    _ = self.navigationController?.popViewController(animated: true)
                })
            }, cancel: "Cancel", cancelCallback: nil)
        }
    }
    
    @IBAction func removeAction(_ sender: Any) {
        let message = application == nil ? "Are you sure you want to delete this talent?" : "Are you sure you want to delete this application?"
        PopupController.showYellow(message, ok: "Delete", okCallback: {
            _ = self.navigationController?.popViewController(animated: true)
            self.chooseDelegate?.remove()
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    static func pushController(jobSeeker: JobSeeker!,
                               job: Job!,
                               application: Application!,
                               chooseDelegate: ChooseDelegate!) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobSeekerDetail") as! JobSeekerDetailController
        controller.jobSeeker = jobSeeker
        controller.job = job
        controller.application = application
        controller.chooseDelegate = chooseDelegate
        AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
    }
    
}
