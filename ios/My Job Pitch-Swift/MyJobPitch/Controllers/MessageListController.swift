//
//  MessageListController.swift
//  MyJobPitch
//
//  Created by dev on 12/26/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import SVPullToRefresh

class MessageListController: SearchController {

    static var refreshRequest = false
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        tableView.addPullToRefresh {
            API.shared().loadApplicationsForJob(jobId: nil, status: nil, shortlisted: false, success: { (data) in
                self.allData = NSMutableArray()
                let deletedID = AppData.getApplicationStatusByName(ApplicationStatus.APPLICATION_DELETED).id
                for application in data as! [Application] {
                    if application.status != deletedID {
                        self.allData.add(application)
                    }
                }
                self.data = self.allData
                self.tableView.reloadData()
                self.tableView.pullToRefreshView.stopAnimating()
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
        }
        
        MessageListController.refreshRequest = true
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        if MessageListController.refreshRequest {
            MessageListController.refreshRequest = false
            tableView.triggerPullToRefresh()
        }
    }
    
    override func filterItem(item: Any, text: String) -> Bool {
        
        let application = item as! Application
        return application.job.locationData.businessData.name.contains(text)
        
    }

}

extension MessageListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "MessageCell", for: indexPath) as! MessageCell
        
        let application = data[indexPath.row] as! Application
        let lastMessage = application.messages.lastObject as! Message
        
        if AppData.user.isJobSeeker() {
            
            if let image = application.job.getImage() {
                AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: cell.imgView, completion: nil)
            } else {
                cell.imgView.image = UIImage(named: "default-logo")
            }
            
            cell.fromLabel.text = application.job.locationData.businessData.name
            
        } else {
            
            if let pitch = application.jobSeeker.getPitch() {
                AppHelper.loadImageURL(imageUrl: (pitch.thumbnail)!, imageView: cell.imgView, completion: nil)
            } else {
                cell.imgView.image = UIImage(named: "no-img")
            }
            
            cell.fromLabel.text = application.jobSeeker.firstName + " " + application.jobSeeker.lastName
            
        }
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MMM dd, HH:mm a"
        cell.attributesLabel.text = dateFormatter.string(from: lastMessage.created)
        
        if lastMessage.fromRole == AppData.getUserRole().id {
            cell.messageLabel.text = String(format: "You: %@", lastMessage.content)
        } else {
            cell.messageLabel.text = lastMessage.content
        }
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        return cell
        
    }
    
}

extension MessageListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let application = data[indexPath.row] as! Application
        MessageController.showModal(application: application)
        
    }
    
}
