//
//  JobDetailController.swift
//  MyJobPitch
//
//  Created by dev on 2/27/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

class JobDetailController: MJPController {

    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var subTitle: UILabel!
    
    var job: Job!
    
    let menuItems = [
        "find_talent", "applications", "connections", "shortlist", "messages"
    ]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        updateJobInfo()
    }
    
    func updateJobInfo() {
        if let image = job.getImage() {
            AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        
        nameLabel.text = job.title
        subTitle.text = job.locationData.businessData.name + ", " + job.locationData.name
    }
    
    @IBAction func editJobAction(_ sender: Any) {
        JobEditController.pushController(location: nil, job: job) { (job) in
            BusinessListController.refreshRequest = true
            BusinessDetailController.refreshRequest = true
            self.job = job
            self.updateJobInfo()
        }
    }
    
    @IBAction func deleteJobAction(_ sender: Any) {
        let message = String(format: "Are you sure you want to delete %@", job.title)
        PopupController.showYellow(message, ok: "Delete", okCallback: {
            
            AppHelper.showLoading("Deleting...")
            
            API.shared().deleteJob(id: self.job.id, success: {
                AppHelper.hideLoading()
                BusinessListController.refreshRequest = true
                BusinessDetailController.refreshRequest = true
                _ = self.navigationController?.popViewController(animated: true)
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
            
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
}


extension JobDetailController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return menuItems.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "JobMenuCell", for: indexPath)
        cell.addUnderLine(paddingLeft: 10, paddingRight: 0, color: AppData.greyBorderColor)
        
        let iconView = cell.viewWithTag(1) as! UIImageView
        let titleView = cell.viewWithTag(2) as! UILabel
        
        let item = SideMenuController.menuItems[menuItems[indexPath.row]]!
        iconView.image = UIImage(named: item["icon"]!)?.withRenderingMode(.alwaysTemplate)
        titleView.text = item["title"]
        
        return cell
    }
    
}

extension JobDetailController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let id = menuItems[indexPath.row]
        if id == "find_talent" {
            SwipeController.pushController(job: job)
        } else if id == "messages" {
            MessageListController.pushController(job: job)
        } else {
            ApplicationListController.pushController(job: job, mode: id)
        }
        
    }
    
}
