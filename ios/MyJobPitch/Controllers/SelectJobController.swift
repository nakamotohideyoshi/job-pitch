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
    
    @IBOutlet weak var infoView: AppInfoSmallView!
    @IBOutlet weak var toolbar: SmallToolbar!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: EmptyView!
    
    var jobs: [Job]!
    
    var titles = [
        "find_talent":  "Select job bellow to start finding talent for your business.",
        "applications": "Select a job below to view applications",
        "interviews":    "Select a job below to view and arrange interviews.",
    ]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        var item = SideMenuController.menuItems[SideMenuController.currentID]!
        infoView.setDescription(icon: item["icon"]!, text: titles[SideMenuController.currentID]!)
        
        toolbar.titleLabel.text = "SELECT A JOB"
        toolbar.rightAction = jobAdd
        
        emptyView.message.text = "You have not added any jobs yet."
        emptyView.button.setTitle("Create job", for: .normal)
        emptyView.action = jobAdd
        
        tableView.addPullToRefresh {
            self.loadJobs()
        }
        
        showLoading()
        loadJobs()
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        if jobs != nil {
            updateList()
        }        
    }
    
    func loadJobs() {
        AppData.getJobs(locationId: nil) { error in
            if error == nil {
                self.hideLoading()
                self.tableView.pullToRefreshView.stopAnimating()
                self.updateList()
            } else {
                self.handleError(error)
            }
        }
    }
    
    func updateList() {
        jobs = AppData.jobs.filter { $0.status == JobStatus.JOB_STATUS_OPEN_ID }
        tableView.reloadData()
        emptyView.isHidden = self.jobs.count > 0
    }
    
    func jobAdd() {
        
        if AppData.businesses.count == 1 {
            
            let controller = BusinessDetailController.instantiate()
            controller.business = AppData.businesses[0]
            navigationController?.pushViewController(controller, animated: true)
            
        } else {
            
            let controller = BusinessListController.instantiate()
            navigationController?.pushViewController(controller, animated: true)
        }
    }    
}

extension SelectJobController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return jobs == nil ? 0 : jobs.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "JobCell", for: indexPath) as! ApplicationCell
        cell.infoView.job = jobs[indexPath.row]
        cell.drawUnderline()
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
