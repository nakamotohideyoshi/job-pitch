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
    
    @IBOutlet weak var emptyView: UILabel!
    
    var job: Job!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Messages"

        tableView.addPullToRefresh {
            self.loadData()
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        AppHelper.showLoading("Loading...")
        loadData()
    }
    
    func loadData() {
        API.shared().loadApplicationsForJob(jobId: job?.id, status: nil, shortlisted: false, success: { (data) in
            AppHelper.hideLoading()
            self.allData = data.mutableCopy() as! NSMutableArray
            self.filter()
            self.emptyView.isHidden = self.allData.count > 0
            self.tableView.pullToRefreshView.stopAnimating()
        }, failure: self.handleErrors)
    }
    
    override func filterItem(item: Any, text: String) -> Bool {
        
        let application = item as! Application
        return application.job.locationData.businessData.name.contains(text)
        
    }
    
    static func pushController(job: Job!) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "MessageList") as! MessageListController
        controller.job = job
        AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
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
        let job = application.job!
        
        if AppData.user.isJobSeeker() {
            
            if let image = job.getImage() {
                AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: cell.imgView, completion: nil)
            } else {
                cell.imgView.image = UIImage(named: "default-logo")
            }
            
            cell.titleLabel.text = job.title
            cell.subTitleLabel.text = job.getBusinessName();
            
        } else {
            
            if let pitch = application.jobSeeker.getPitch() {
                AppHelper.loadImageURL(imageUrl: (pitch.thumbnail)!, imageView: cell.imgView, completion: nil)
            } else {
                cell.imgView.image = UIImage(named: "no-img")
            }
            cell.titleLabel.text = application.jobSeeker.getFullName()
            cell.subTitleLabel.text = String(format: "%@ (%@)", job.title, job.getBusinessName());
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
        MessageController0.showModal(application: application)
        
    }
    
}
