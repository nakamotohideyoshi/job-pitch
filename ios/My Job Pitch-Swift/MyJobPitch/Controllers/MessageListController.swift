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
    
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: UILabel!
    
    var applications = [(Application, Int)]()
        
    override func viewDidLoad() {
        super.viewDidLoad()        
        
        tableView.addPullToRefresh {
            self.loadData()
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        AppData.appsRefreshTime = AppData.MESSAGE_REFRESH_TIME
        AppData.refreshCallback = {
            self.loadData1()
        }
        
        loadData()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        AppData.appsRefreshTime = AppData.DEFAULT_REFRESH_TIME
        AppData.refreshCallback = nil
    }
    
    func loadData() {
        AppData.updateJobSeeker(success: nil, failure: nil)
        tableView.pullToRefreshView.stopAnimating()
        loadData1()
    }
    
    func loadData1() {
        applications.removeAll()
        for application in AppData.applications {
            if application.messages.count > 0 {
                let newMsgs = application.getNewMessageCount()
                applications.append((application, newMsgs))
            }
        }

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
        
        let (application, newMsgs) = applications[indexPath.row]
        let job = application.job!
        let lastMessage = application.messages?.lastObject as! Message
        let message = lastMessage.fromRole == AppData.getUserRole().id ? String(format: "You: %@", (lastMessage.content)!) : lastMessage.content
        let deleted = application.status == ApplicationStatus.APPLICATION_DELETED_ID
        
        var title: String!, subTitle: String!
        if AppData.user.isJobSeeker() {
            AppHelper.loadLogo(job, imageView: cell.imgView, completion: nil)
            title = job.title
            subTitle = job.getBusinessName()
        } else {
            AppHelper.loadPhoto(application.jobSeeker, imageView: cell.imgView, completion: nil)
            title = application.jobSeeker.getFullName()
            subTitle = String(format: "%@ (%@)", job.title, job.getBusinessName())
        }
        
        cell.imgView.alpha = deleted ? 0.5 : 1
        cell.titleLabel.setDeletedText(title, isDeleted: deleted)
        cell.subTitleLabel.setDeletedText(subTitle, isDeleted: deleted)
        cell.attributesLabel.setDeletedText(AppHelper.dateToShortString((lastMessage.created)!), isDeleted: deleted)
        cell.messageLabel.setDeletedText(message!, isDeleted: deleted)
        
        cell.badge.text = newMsgs < 10 ? "\(newMsgs)" : "9+"
        cell.badge.isHidden = newMsgs == 0
        
        cell.backgroundColor = deleted ? AppData.lightGreyColor : .white
        cell.addUnderLine(paddingLeft: 12, paddingRight: 0, color: AppData.greyColor)
        
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
        controller.application = applications[indexPath.row].0
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
}
