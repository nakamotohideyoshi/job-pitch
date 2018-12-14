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
        AppData.appsUpdateCallback = {
            self.loadData1()
        }
        
        loadData()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        AppData.appsRefreshTime = AppData.DEFAULT_REFRESH_TIME
        AppData.appsUpdateCallback = nil
    }
    
    func loadData() {
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

        cell.application = application
        cell.newMsgs = newMsgs
        cell.drawUnderline()
        
        return cell
    }
}

extension MessageListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
       
//        if jobseeker != nil {
//            if (!jobseeker.active) {
//                PopupController.showGreen("To message please active your account", ok: "activate", okCallback: {
//                    let controller = AppHelper.instantiate("JobseekerProfile") as! JobseekerProfileController
//                    controller.saveComplete = { () in
//                        SideMenuController.pushController(id: "find_job")
//                    }
//                    controller.activation = true
//                    let navController = UINavigationController(rootViewController: controller)
//                    self.present(navController, animated: true, completion: nil)
//                }, cancel: NSLocalizedString("Cancel", comment: ""), cancelCallback: nil)
//                return
//            }
//        } else {
//            let application = data[indexPath.row] as! Application
//            if (application.job.status == 2) {
//                PopupController.showGreen("To message please active your account", ok: "activate", okCallback: {
//                    JobEditController.pushController(location: nil, job: application.job)
//                }, cancel: NSLocalizedString("Cancel", comment: ""), cancelCallback: nil)
//                return
//            }
//        }
        
        let controller = MessageController0.instantiate()
        controller.application = applications[indexPath.row].0
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
}
