//
//  SelectJobController.swift
//  MyJobPitch
//
//  Created by dev on 12/23/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class SelectJobController: MJPController {
    
    @IBOutlet weak var headerImgView: UIImageView!
    @IBOutlet weak var headerTitle: UILabel!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: UIView!
    
    var jobs: [Job]! = [Job]()
    
    var titles = [
        "find_talent":  "Select job bellow to start finding talent for your business.",
        "applications": "Select a job below to view applications",
        "interviews":    "Select a job below to view and arrange interviews.",
    ]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        var item = SideMenuController.menuItems[SideMenuController.currentID]!
        headerImgView.image = UIImage(named: item["icon"]!)?.withRenderingMode(.alwaysTemplate)
        headerTitle.text = titles[SideMenuController.currentID]
        
        tableView.addPullToRefresh {
            self.loadData()
        }
        
        showLoading()
        loadData()
    }
    
    func loadData() {
        
        self.emptyView.isHidden = true
        
        AppData.getJobs(locationId: nil, success: { 
            self.hideLoading()
            self.jobs = AppData.jobs.filter { $0.status == JobStatus.JOB_STATUS_OPEN_ID }
            self.tableView.reloadData()
            self.tableView.pullToRefreshView.stopAnimating()
            self.emptyView.isHidden = self.jobs.count > 0
        }, failure: self.handleErrors)
    }
    
    @IBAction func jobAddAction(_ sender: Any) {
        
        if AppData.user.businesses.count > 1 {
            
            let controller = BusinessListController.instantiate()
            navigationController?.pushViewController(controller, animated: true)
            
        } else {
            
            let controller = BusinessDetailController.instantiate()
            controller.businessId = AppData.user.businesses[0] as! NSNumber
            navigationController?.pushViewController(controller, animated: true)
        }
    }    
}

extension SelectJobController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return jobs.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "JobCell", for: indexPath) as! JobCell
        cell.setData(jobs[indexPath.row])
        return cell
    }
}

extension SelectJobController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let job = jobs[indexPath.row]
        
        if SideMenuController.currentID == "find_talent" {
            
            let controller = SwipeController.instantiate()
            controller.searchJob = job
            navigationController?.pushViewController(controller, animated: true)
            
        } else if SideMenuController.currentID == "applications" {
            
            let controller = RCApplicationListController.instantiate()
            controller.job = job
            navigationController?.pushViewController(controller, animated: true)
            
        } else if SideMenuController.currentID == "interviews" {
            
            let controller = InterviewListController.instantiate()
            controller.job = job
            navigationController?.pushViewController(controller, animated: true)
        }
    }
}
