//
//  JobDetailController.swift
//  MyJobPitch
//
//  Created by dev on 2/27/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

class JobDetailController: MJPController {

    @IBOutlet weak var headerImgView: UIImageView!
    @IBOutlet weak var headerName: UILabel!
    @IBOutlet weak var headerSubTitle: UILabel!
    @IBOutlet weak var tableView: UITableView!
    
    var job: Job!
    
    var isRecruiter = false
    var refresh = true
    
    let menuItems = [
        "find_talent", "applications", "applications", "applications", "interviews"
    ]
    
    let titles = [
        "Find Talent", "New Applications", "My Connections", "My Shortlist", "Interviews"
    ]
    
    var countItems = [
        "", "", "", "", ""
    ]
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        if refresh {
            refresh = false
            showLoading()
            isRecruiter = AppData.user.isRecruiter()
            
            API.shared().loadJob(id: job.id, success: { (data) in
                self.job = data as! Job
                self.updateJobInfo()
            }, failure: self.handleErrors)
            self.getAllApplications()
        }
        
    }
    
    func getAllApplications() {
        var cnt_applications = 0, cnt_connections = 0, cnt_shortlists = 0
        API.shared().loadApplicationsForJob(jobId: job.id, status: nil, shortlisted: false, success: { (data) in
            for application in data as! [Application] {
                if application.status == 1 {
                   cnt_applications += 1
                } else if application.status == 2  {
                    cnt_connections += 1
                    if application.shortlisted {
                        cnt_shortlists += 1
                    }
                }
            }
            self.countItems[1] = " (\(cnt_applications))"
            self.countItems[2] = " (\(cnt_connections))"
            self.countItems[3] = " (\(cnt_shortlists))"
            self.tableView.reloadData()
            self.hideLoading()
        }, failure: self.handleErrors)
    }
    
    func updateJobInfo() {
        AppHelper.loadLogo(job, imageView: headerImgView, completion: nil)
        headerName.text = job.title
        headerSubTitle.text = job.getBusinessName()
    }
    
    @IBAction func editJobAction(_ sender: Any) {
        self.refresh = true
        let controller = JobEditController.instantiate()
        controller.job = job
        navigationController?.pushViewController(controller, animated: true)
    }
    
    @IBAction func deleteJobAction(_ sender: Any) {
        let message = String(format: "Are you sure you want to delete %@", job.title)
        PopupController.showYellow(message, ok: "Delete", okCallback: {
            
            self.showLoading()
            API.shared().deleteJob(id: self.job.id, success: {
                self.hideLoading()
                _ = self.navigationController?.popViewController(animated: true)
            }, failure: self.handleErrors)
            
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func shareAction(_ sender: Any) {
        let url = String(format: "%@/jobseeker/jobs/%@", API.apiRoot.absoluteString, job.id)
        let itemProvider = ShareProvider(placeholderItem: url)
        let controller = UIActivityViewController(activityItems: [itemProvider], applicationActivities: nil)
        present(controller, animated: true, completion: nil)
    }
    
    static func instantiate() -> JobDetailController {
        return AppHelper.instantiate("JobDetail") as! JobDetailController
    }
    
}


extension JobDetailController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return menuItems.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "JobMenuCell", for: indexPath)
        cell.addUnderLine(paddingLeft: 12, paddingRight: 0, color: AppData.greyColor)
        
        let iconView = cell.viewWithTag(1) as! UIImageView
        let titleView = cell.viewWithTag(2) as! UILabel
        
        let item = SideMenuController.menuItems[menuItems[indexPath.row]]!
        let count = countItems[indexPath.row]
        iconView.image = UIImage(named: item["icon"]!)?.withRenderingMode(.alwaysTemplate)
        titleView.text = titles[indexPath.row] + count
        
        return cell
    }
    
}

extension JobDetailController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let id = menuItems[indexPath.row]
        if id == "find_talent" {
            let controller = SwipeController.instantiate()
            controller.searchJob = job
            navigationController?.pushViewController(controller, animated: true)
        } else if id == "interviews" {
            let controller = InterviewListController.instantiate()
            controller.job = job
            navigationController?.pushViewController(controller, animated: true)
        } else if id == "applications" {
            let controller = RCApplicationListController.instantiate()
            controller.job = job
            controller.defaultTab = indexPath.row - 1
            navigationController?.pushViewController(controller, animated: true)
        }
        
    }
    
}
