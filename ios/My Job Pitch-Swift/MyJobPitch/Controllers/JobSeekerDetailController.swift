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
    
    var jobSeeker: JobSeeker!
    var application: Application!
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
        
        if jobSeeker.cv == nil {
            cvButton.removeFromSuperview()
        }
        
        // contact info
        
        if isConnected {
            
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
            
        } else {
            
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
        
    }

    @IBAction func applyAction(_ sender: Any) {
        
        if isConnected {
            
            MessageController.showModal(application: application)
            
        } else {
        
            let message = application == nil ? "Are you sure you want to connect this talent?" : "Are you sure you want to connect this application?"
            
            PopupController.showGreen(message, ok: "Connect", okCallback: {
                _ = self.navigationController?.popViewController(animated: true)
                self.chooseDelegate?.apply()
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
                               application: Application!,
                               chooseDelegate: ChooseDelegate!) {
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobSeekerDetail") as! JobSeekerDetailController
        controller.jobSeeker = jobSeeker
        controller.application = application
        controller.chooseDelegate = chooseDelegate
        AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
        
    }
    
}
