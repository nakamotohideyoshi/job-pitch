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
    @IBOutlet weak var noPitchView: UIView!
    
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
        showLoading()
        
        if !AppData.user.isRecruiter() {
            API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
                let jobSeeker = data as! JobSeeker
                if jobSeeker.getPitch() != nil {
                    self.loadData()
                } else {
                    self.noPitchView.isHidden = false
                    self.navigationItem.rightBarButtonItem = nil
                    self.hideLoading()
                }
            }, failure: self.handleErrors)
        } else {
            loadData()
        }
    }
    
    func loadData() {
        API.shared().loadApplicationsForJob(jobId: job?.id, status: nil, shortlisted: false, success: { (data) in
            self.hideLoading()
            self.allData = data.mutableCopy() as! NSMutableArray
            self.filter()
            self.emptyView.isHidden = self.allData.count > 0
            self.tableView.pullToRefreshView.stopAnimating()
        }, failure: self.handleErrors)
    }
    
    override func filterItem(item: Any, text: String) -> Bool {
        
        let application = item as! Application
        for message in application.messages as! [Message] {
            if message.content.lowercased().contains(text) {
                return true
            }
        }
        return application.job.locationData.businessData.name.lowercased().contains(text)
        
    }
    
    @IBAction func noRecordNow(_ sender: Any) {
        SideMenuController.pushController(id: "add_record")
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
            cell.subTitleLabel.text = job.getBusinessName()
            
        } else {
            
            if let pitch = application.jobSeeker.getPitch() {
                AppHelper.loadImageURL(imageUrl: (pitch.thumbnail)!, imageView: cell.imgView, completion: nil)
            } else {
                cell.imgView.image = UIImage(named: "no-img")
            }
            cell.titleLabel.text = application.jobSeeker.getFullName()
            cell.subTitleLabel.text = String(format: "%@ (%@)", job.title, job.getBusinessName())
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
        
        if application.status == AppData.getApplicationStatusByName(ApplicationStatus.APPLICATION_DELETED).id {
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
            cell.backgroundColor = UIColor(red: 240/256.0, green: 240/256.0, blue: 240/256.0, alpha: 0.5)
        } else {
            cell.setOpacity(1)
            cell.backgroundColor = UIColor.white
        }
        
        return cell
        
    }
    
}

extension MessageListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let application = data[indexPath.row] as! Application
        let goAllMessages = job != nil
        MessageController0.showModal(application: application, goAllMessages: goAllMessages)
        
    }
    
}
