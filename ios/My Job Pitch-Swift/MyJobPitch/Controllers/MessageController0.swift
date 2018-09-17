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
    @IBOutlet weak var bannerLabel: UILabel!
    
    var application: Application!
    
    var interview: ApplicationInterview!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        navigationItem.leftBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav-close"), style: .plain, target: self, action: #selector(closeAction))
        
        if AppData.user.isRecruiter() {
            let subTitle = String(format: "%@, (%@)", application.job.title, application.job.getBusinessName())
            setTitle(title: "Messages", subTitle: subTitle)
        }
        
        headerView.addUnderLine(paddingLeft: 0, paddingRight: 0, color: AppData.greyColor)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        loadApplication()
    }
    
    func loadApplication() {
        
        application = (AppData.applications.filter { $0.id == application.id })[0]
        let job = application.job!
        
        if AppData.user.isJobSeeker() {
            AppHelper.loadLogo(image: job.getImage(), imageView: imgView, completion: nil)
            titleLabel.text = job.title
            subTitleLabel.text = job.getBusinessName()
        } else {
            let interviews = application.interviews as! [ApplicationInterview]
            let filters = interviews.filter { $0.status == InterviewStatus.INTERVIEW_PENDING || $0.status == InterviewStatus.INTERVIEW_ACCEPTED }
            if filters.count > 0 {
                interview = filters[0]
                navigationItem.rightBarButtonItem = nil
            } else {
                navigationItem.rightBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav-interview"), style: .plain, target: self, action: #selector(createInterview))
            }

            AppHelper.loadJobseekerAvatar(application.jobSeeker, imageView: imgView, completion: nil)
            titleLabel.text = application.jobSeeker.getFullName()
            subTitleLabel.text = application.jobSeeker.desc
        }
        
        if interview != nil {
            let subTitle = "Interview: " + AppHelper.convertDateToString(interview.at)
            let subTitleParameters = [NSForegroundColorAttributeName : interview.status == InterviewStatus.INTERVIEW_PENDING ? AppData.yellowColor : AppData.greyColor,
                                      NSFontAttributeName : UIFont.systemFont(ofSize: 14)]
            bannerLabel.attributedText = NSMutableAttributedString(string: subTitle, attributes: subTitleParameters)
        } else {
            bannerLabel.superview?.isHidden = true
        }
        
        let controller = AppHelper.instantiate("Message") as! MessageController
        controller.application = application
        controller.view.frame = CGRect(origin: CGPoint.zero, size: containerView.frame.size)
        containerView.addSubview(controller.view)
        addChildViewController(controller)
    }
    
    func createInterview() {
        let controller = InterviewEditController.instantiate()
        controller.application = application
        controller.interview = interview
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    @IBAction func headerClickAction(_ sender: Any) {
        if AppData.user.isJobSeeker() {
            let controller = ApplicationDetailsController.instantiate()
            controller.application = application
            controller.onlyView = true
            navigationController?.pushViewController(controller, animated: true)
        } else {
            let controller = JobSeekerDetailController.instantiate()
            controller.application = application
            controller.readOnly = true
            navigationController?.pushViewController(controller, animated: true)
        }
    }
    
    func closeAction() {
        navigationController?.dismiss(animated: true, completion: nil)
    }

    static func instantiate() -> MessageController0 {
        return AppHelper.instantiate("Message0") as! MessageController0
    }
    
}
