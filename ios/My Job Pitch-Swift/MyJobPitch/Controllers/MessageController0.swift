//
//  MessageController0.swift
//  MyJobPitch
//
//  Created by dev on 2/24/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

class MessageController0: MJPController {
    
    @IBOutlet weak var headerView: UIView!
    @IBOutlet weak var imgView: UIImageView!;
    @IBOutlet weak var titleLabel: UILabel!;
    @IBOutlet weak var subTitleLabel: UILabel!;
    
    static var application: Application!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        headerView.addUnderLine(paddingLeft: 0, paddingRight: 0, color: AppData.greyBorderColor)
        
        if AppData.user.isJobSeeker() {
            
            if let image = MessageController0.application.job.getImage() {
                AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
            } else {
                imgView.image = UIImage(named: "default-logo")
            }
            
            titleLabel.text = MessageController0.application.job.locationData.businessData.name
            
        } else {
            
            if let pitch = MessageController0.application.jobSeeker.getPitch() {
                AppHelper.loadImageURL(imageUrl: (pitch.thumbnail)!, imageView: imgView, completion: nil)
            } else {
                imgView.image = UIImage(named: "no-img")
            }
            titleLabel.text = MessageController0.application.jobSeeker.firstName + " " + MessageController0.application.jobSeeker.lastName
            
        }
        
        subTitleLabel.text = String(format: "%@ (%@, %@)", MessageController0.application.job.title, MessageController0.application.job.locationData.name, MessageController0.application.job.locationData.businessData.name);
        
    }
    
    @IBAction func closeAction(_ sender: Any) {
        navigationController?.dismiss(animated: true, completion: nil)
    }

    static func showModal(application: Application) {
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Message") as! MessageController0
        MessageController0.application = application
        let navController = UINavigationController(rootViewController: controller)
        AppHelper.getFrontController().present(navController, animated: true, completion: nil)
        
    }
    
}
