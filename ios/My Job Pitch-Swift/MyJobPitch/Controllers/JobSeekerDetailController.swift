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
    @IBOutlet weak var availableView: UIView!
    @IBOutlet weak var truthfulView: UIView!
    
    var jobSeeker: JobSeeker!
    var application: Application!
    var job: Job!
    var chooseDelegate: ChooseDelegate!
    
    var isConnected = false
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.

        isConnected = application?.status == AppData.getApplicationStatusByName(ApplicationStatus.APPLICATION_ESTABLISHED).id
        
        let pitch = jobSeeker.getPitch()
        if pitch != nil {
            AppHelper.loadImageURL(imageUrl: (pitch?.thumbnail)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "no-img")
        }
        
        nameLabel.text = jobSeeker.firstName + " " + jobSeeker.lastName
        
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
        
        if !jobSeeker.hasReferences {
            availableView.removeFromSuperview()
        }
        if !jobSeeker.truthConfirmation {
            truthfulView.removeFromSuperview()
        }
        
        // contact info
        
        if isConnected {
            
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
            
        } else {
            
            cvButton.removeFromSuperview()
            contactView.removeFromSuperview()
            applyButton.setTitle("Connect", for: .normal)
            
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
        UIApplication.shared.openURL(URL(string: jobSeeker.cv)!)
    }
    
    @IBAction func shortlistedChanged(_ sender: Any) {
        
        application.shortlisted = shortlisted.isOn
        
        let update = ApplicationShortlistUpdate()
        update.id = application.id
        update.shortlisted = application.shortlisted
        
        AppHelper.showLoading("Updating...")
        API.shared().updateApplicationShortlist(update: update, success: { (_) in
            AppHelper.hideLoading()
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
        
    }
    

    @IBAction func applyAction(_ sender: Any) {
        
        if isConnected {
            
            MessageController0.showModal(application: application)
            
        } else {
            
            if job.locationData.businessData.tokens.intValue > 0 {
                let message = application == nil ? "Are you sure you want to connect this talent?" : "Are you sure you want to connect this application?"
                
                PopupController.showGreen(message, ok: "Connect", okCallback: {
                    _ = self.navigationController?.popViewController(animated: true)
                    self.chooseDelegate?.apply()
                }, cancel: "Cancel", cancelCallback: nil)
            } else {
                PopupController.showGray("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.", ok: "Ok")
            }
            
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
                               application: Application!,
                               job: Job,
                               chooseDelegate: ChooseDelegate!) {
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobSeekerDetail") as! JobSeekerDetailController
        controller.jobSeeker = jobSeeker
        controller.application = application
        controller.job = job
        controller.chooseDelegate = chooseDelegate
        AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
        
    }
    
}
