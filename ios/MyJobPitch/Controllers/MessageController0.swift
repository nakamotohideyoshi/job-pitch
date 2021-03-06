//
//  MessageController0.swift
//  MyJobPitch
//
//  Created by dev on 2/24/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

class MessageController0: MJPController {

    @IBOutlet weak var infoView: AppInfoSmallView!
    @IBOutlet weak var containerView: UIView!
    @IBOutlet weak var interviewButton: UIButton!
    
    public var application: Application!

    var interview: Interview!
    var messageController: MessageController!    
    var viewHeight: CGFloat!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        isModal = true
        
        if AppData.user.isRecruiter() {
            let subTitle = String(format: "%@, (%@)", application.job.title, application.job.getBusinessName())
            setTitle(title: NSLocalizedString("Messages", comment: ""), subTitle: subTitle)
        }
        
        infoView.addUnderLine(paddingLeft: 0, paddingRight: 0, color: AppData.greyColor)
        interviewButton.superview?.addUnderLine(paddingLeft: 0, paddingRight: 0, color: AppData.greyColor)
        
        messageController = MessageController.instantiate()
        messageController.application = application
        containerView.addSubview(messageController.view)
        messageController.view.frame = containerView.bounds
        messageController.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        addChildViewController(messageController)
        
        if application.getNewMessageCount() > 0 {
            let updated = MessageForUpdate()
            updated.id = (application.messages.lastObject as! Message).id
            API.shared().updateMessageStatus(updated) { (_, error) in
                if error == nil {
                    AppData.getApplication(self.application.id, complete: nil)
                } else {
                    self.handleError(error)
                }
            }
        }
        
        loadData()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)

        AppData.appsRefreshTime = AppData.MESSAGE_REFRESH_TIME
        AppData.appsUpdateCallback = {
            self.loadData()
        }

        loadData()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)

        AppData.appsRefreshTime = AppData.DEFAULT_REFRESH_TIME
        AppData.appsUpdateCallback = nil
    }
    
    func loadData() {
        
        application = (AppData.applications.filter { $0.id == application.id })[0]
        interview = application.getInterview()
        
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
            
            navigationItem.rightBarButtonItem = interview == nil ? UIBarButtonItem(image: UIImage(named: "nav-interview"), style: .plain, target: self, action: #selector(createInterview)) : nil
        }
        
        if interview != nil {
            interviewButton.setTitle(NSLocalizedString("Interview", comment: "") + ": " + AppHelper.dateToLongString(interview.at), for: .normal)
        }
        
        interviewButton.superview?.isHidden = interview == nil
        
        messageController.application = application
        messageController.updateData()
    }
    
    func createInterview() {
        let controller = InterviewEditController.instantiate()
        controller.application = application
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }

    @IBAction func interviewAction(_ sender: Any) {
        let controller = InterviewDetailsController.instantiate()
        controller.application = application
        navigationController?.pushViewController(controller, animated: true)
    }
    
    static func instantiate() -> MessageController0 {
        return AppHelper.instantiate("Message0") as! MessageController0
    }
}
