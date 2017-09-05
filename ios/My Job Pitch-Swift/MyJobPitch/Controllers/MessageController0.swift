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
    @IBOutlet weak var containerView: UIView!
    
    var application: Application!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        headerView.addUnderLine(paddingLeft: 0, paddingRight: 0, color: AppData.greyBorderColor)
        
        headerView.isHidden = true
        showLoading()
        API.shared().loadApplicationWithId(id: application.id, success: { (data) in
            self.headerView.isHidden = false
            self.hideLoading()
            
            self.application = data as! Application
            self.load()
        }, failure: self.handleErrors)
        
    }
    
    func load() {
        
        let job = application.job!
        
        if AppData.user.isJobSeeker() {
            
            if let image = job.getImage() {
                AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
            } else {
                imgView.image = UIImage(named: "default-logo")
            }
            
            titleLabel.text = job.title
            subTitleLabel.text = job.getBusinessName()
            
        } else {
            
            let jobSeeker = application.jobSeeker!
            if let pitch = jobSeeker.getPitch() {
                AppHelper.loadImageURL(imageUrl: (pitch.thumbnail)!, imageView: imgView, completion: nil)
            } else {
                imgView.image = UIImage(named: "no-img")
            }
            titleLabel.text = jobSeeker.getFullName()
            subTitleLabel.text = String(format: "%@ (%@)", job.title, job.getBusinessName())
        }
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Message") as! MessageController
        controller.application = application
        controller.view.frame = CGRect(origin: CGPoint.zero, size: containerView.frame.size)
        containerView.addSubview(controller.view)
        addChildViewController(controller)
        
    }
    
    @IBAction func headerClickAction(_ sender: Any) {
        if AppData.user.isJobSeeker() {
            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "ApplicationDetail") as! ApplicationDetailController
            controller.application = application
            controller.onlyView = true
            navigationController?.pushViewController(controller, animated: true)
        } else {
            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobSeekerDetail") as! JobSeekerDetailController
            controller.application = application
            controller.onlyView = true
            navigationController?.pushViewController(controller, animated: true)
        }
    }
    
    @IBAction func closeAction(_ sender: Any) {
        navigationController?.dismiss(animated: true, completion: nil)
    }

    static func showModal(application: Application) {
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Message0") as! MessageController0
        controller.application = application
        let navController = UINavigationController(rootViewController: controller)
        AppHelper.getFrontController().present(navController, animated: true, completion: nil)
        
    }
    
}
