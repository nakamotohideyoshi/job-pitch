//
//  MessageListController.swift
//  MyJobPitch
//
//  Created by dev on 12/26/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import SVPullToRefresh

class MessageListController: MJPController {
    
    @IBOutlet weak var emptyView: UILabel!
    @IBOutlet weak var tableView: UITableView!
    
    var applications = [Application]()
    
    var job: Job!
    var jobSeeker: JobSeeker!
        
    override func viewDidLoad() {
        super.viewDidLoad()        
        
        if (self.job != nil) {
            let subTitle = String(format: "%@, (%@)", job.title, job.getBusinessName())
            setTitle(title: "Messages", subTitle: subTitle)
        }

        tableView.addPullToRefresh {
            self.loadData()
        }
        
        if AppData.user.isJobSeeker() {
            showLoading()
            
            API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
                self.hideLoading()
                self.jobSeeker = data as! JobSeeker                
                self.loadData()
            }, failure: self.handleErrors)
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        if AppData.user.isRecruiter() || jobSeeker != nil {
            loadData()
        }
    }
    
    func loadData() {
        applications = AppData.applications.filter { job == nil || job.id == $0.job.id }
        tableView.pullToRefreshView.stopAnimating()
        tableView.reloadData()
        emptyView.isHidden = applications.count > 0
    }
    
    static func instantiate() -> MessageListController {
        return AppHelper.instantiate("MessageList") as! MessageListController
    }
}

extension MessageListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return applications.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "MessageCell", for: indexPath) as! MessageCell
        
        let application = applications[indexPath.row]
        let job = application.job!
        
        if AppData.user.isJobSeeker() {
            AppHelper.loadLogo(image: job.getImage(), imageView: cell.imgView, completion: nil)
            cell.titleLabel.text = job.title
            cell.subTitleLabel.text = job.getBusinessName()
        } else {
            AppHelper.loadJobseekerAvatar(application.jobSeeker, imageView: cell.imgView, completion: nil)
            cell.titleLabel.text = application.jobSeeker.getFullName()
            cell.subTitleLabel.text = String(format: "%@ (%@)", job.title, job.getBusinessName())
        }
        
        if let lastMessage = application.messages?.lastObject as? Message {
            cell.attributesLabel.text = AppHelper.convertDateToString((lastMessage.created)!, short: true)
            
            if lastMessage.fromRole == AppData.getUserRole().id {
                cell.messageLabel.text = String(format: "You: %@", (lastMessage.content)!)
            } else {
                cell.messageLabel.text = lastMessage.content
            }
        } else {
            cell.attributesLabel.text = ""
            cell.messageLabel.text = ""
        }
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyColor)
        
        if application.status == ApplicationStatus.APPLICATION_DELETED_ID {
            var str: NSMutableAttributedString =  NSMutableAttributedString(string: cell.titleLabel.text!)
            str.addAttribute(NSStrikethroughStyleAttributeName, value: 1, range: NSMakeRange(0, str.length))
            str.addAttribute(NSFontAttributeName, value: UIFont.italicSystemFont(ofSize: 20), range: NSMakeRange(0, str.length))
            cell.titleLabel.attributedText = str
            
            str =  NSMutableAttributedString(string: cell.subTitleLabel.text!)
            str.addAttribute(NSStrikethroughStyleAttributeName, value: 1, range: NSMakeRange(0, str.length))
            str.addAttribute(NSFontAttributeName, value: UIFont.italicSystemFont(ofSize: 14), range: NSMakeRange(0, str.length))
            cell.subTitleLabel.attributedText = str
            
            str =  NSMutableAttributedString(string: cell.messageLabel.text!)
            str.addAttribute(NSStrikethroughStyleAttributeName, value: 1, range: NSMakeRange(0, str.length))
            str.addAttribute(NSFontAttributeName, value: UIFont.italicSystemFont(ofSize: 14), range: NSMakeRange(0, str.length))
            cell.messageLabel.attributedText = str
            
            str =  NSMutableAttributedString(string: cell.attributesLabel.text!)
            str.addAttribute(NSStrikethroughStyleAttributeName, value: 1, range: NSMakeRange(0, str.length))
            str.addAttribute(NSFontAttributeName, value: UIFont.italicSystemFont(ofSize: 12), range: NSMakeRange(0, str.length))
            cell.attributesLabel.attributedText = str
            
            cell.setOpacity(0.5)
            cell.backgroundColor = UIColor(red: 240/255.0, green: 240/255.0, blue: 240/255.0, alpha: 0.5)
        } else {
            cell.setOpacity(1)
            cell.backgroundColor = UIColor.white
        }
        
        return cell
        
    }
    
}

extension MessageListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
       
//        if jobSeeker != nil {
//            if (!jobSeeker.active) {
//                PopupController.showGreen("To message please active your account", ok: "activate", okCallback: {
//                    let controller = AppHelper.instantiate("JobSeekerProfile") as! JobSeekerProfileController
//                    controller.saveComplete = { () in
//                        SideMenuController.pushController(id: "find_job")
//                    }
//                    controller.activation = true
//                    let navController = UINavigationController(rootViewController: controller)
//                    self.present(navController, animated: true, completion: nil)
//                }, cancel: "Cancel", cancelCallback: nil)
//                return
//            }
//        } else {
//            let application = data[indexPath.row] as! Application
//            if (application.job.status == 2) {
//                PopupController.showGreen("To message please active your account", ok: "activate", okCallback: {
//                    JobEditController.pushController(location: nil, job: application.job)
//                }, cancel: "Cancel", cancelCallback: nil)
//                return
//            }
//        }
        
        let controller = MessageController0.instantiate()
        controller.application = applications[indexPath.row]
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
        
    }
    
}
