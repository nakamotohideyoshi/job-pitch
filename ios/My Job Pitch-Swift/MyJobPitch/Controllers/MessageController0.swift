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
    @IBOutlet weak var bannerLabel: UILabel!
    
    public var application: Application!

    var interview: ApplicationInterview!
    var messageController: MessageController!    
    var viewHeight: CGFloat!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        isModal = true
        
        if AppData.user.isRecruiter() {
            let subTitle = String(format: "%@, (%@)", application.job.title, application.job.getBusinessName())
            setTitle(title: "Messages", subTitle: subTitle)
        }
        
        infoView.addUnderLine(paddingLeft: 0, paddingRight: 0, color: AppData.greyColor)
        
        messageController = MessageController.instantiate()
        messageController.application = application
        containerView.addSubview(messageController.view)
        messageController.view.frame = containerView.bounds
        messageController.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        addChildViewController(messageController)
        
        if application.getNewMessageCount() > 0 {
            let updated = MessageForUpdate()
            updated.id = (application.messages.lastObject as! Message).id
            API.shared().updateMessageStatus(update: updated, success: { (_) in
                AppData.updateApplication(self.application.id, success: nil, failure: nil)
            }, failure: nil)
        }
        
        loadData()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)

        AppData.appsRefreshTime = AppData.MESSAGE_REFRESH_TIME
        AppData.refreshCallback = {
            self.loadData()
        }

        loadData()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)

        AppData.appsRefreshTime = AppData.DEFAULT_REFRESH_TIME
        AppData.refreshCallback = nil
    }
    
    func loadData() {
        
        application = (AppData.applications.filter { $0.id == application.id })[0]
        interview = application.getInterview()
        
        if AppData.user.isJobSeeker() {

            infoView.setData(application.job) {
                let controller = ApplicationDetailsController.instantiate()
                controller.application = self.application
                controller.viewMode = true
                self.navigationController?.pushViewController(controller, animated: true)
            }

        } else {
            
            infoView.setData(application.jobSeeker) {
                let controller = JobSeekerDetailController.instantiate()
                controller.application = self.application
                controller.isHideMessages = true
                self.navigationController?.pushViewController(controller, animated: true)
            }
            
            navigationItem.rightBarButtonItem = interview == nil ? UIBarButtonItem(image: UIImage(named: "nav-interview"), style: .plain, target: self, action: #selector(createInterview)) : nil
        }
        
        if interview != nil {
            let subTitle = "Interview: " + AppHelper.dateToLongString(interview.at)
            let subTitleParameters = [NSForegroundColorAttributeName : interview.status == InterviewStatus.INTERVIEW_PENDING ? AppData.yellowColor : AppData.greenColor,
                                      NSFontAttributeName : UIFont.systemFont(ofSize: 14)]
            bannerLabel.attributedText = NSMutableAttributedString(string: subTitle, attributes: subTitleParameters)
        }
        
        bannerLabel.superview?.isHidden = interview == nil
        
        messageController.application = application
        messageController.updateData()
    }
    
    func createInterview() {
        let controller = InterviewEditController.instantiate()
        controller.application = application
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    static func instantiate() -> MessageController0 {
        return AppHelper.instantiate("Message0") as! MessageController0
    }
}
