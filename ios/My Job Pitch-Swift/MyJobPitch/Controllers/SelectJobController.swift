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
    
    @IBOutlet weak var headerView: UIView!
    @IBOutlet weak var headerImgView: UIImageView!
    @IBOutlet weak var headerTitle: UILabel!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: UIView!
    
    var data: NSMutableArray! = NSMutableArray()
    
    var jobActive: NSNumber!
    
    var titles = [
        "find_talent":  "Select job bellow to start finding talent for your business.",
        "applications": "Select a job below to view job seekers who have expressed interest in a job.",
        "connections":  "Select a job below to view job seekers you have connected with.",
        "shortlist":    "Select a job below to view the job seekers you have shortlisted for that role.",
    ]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        var item = SideMenuController.menuItems[SideMenuController.currentID]!
        headerImgView.image = UIImage(named: item["icon"]!)?.withRenderingMode(.alwaysTemplate)
        headerTitle.text = titles[SideMenuController.currentID]
        
        jobActive = AppData.getJobStatusByName(JobStatus.JOB_STATUS_OPEN).id
        
        tableView.addPullToRefresh {
            self.refresh()
        }
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        AppHelper.showLoading("Loading...")
        refresh()
    }
    
    func refresh() {
        API.shared().loadJobsForLocation(locationId: nil, success: { (data) in
            AppHelper.hideLoading()
            self.data = data.mutableCopy() as! NSMutableArray
            self.emptyView.isHidden = self.data.count > 0
            self.tableView.reloadData()
            self.tableView.pullToRefreshView.stopAnimating()
        }, failure: self.handleErrors)        
    }
    
    @IBAction func jobAddAction(_ sender: Any) {
        
        if AppData.user.canCreateBusinesses || AppData.user.businesses.count==0 {
            
            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "BusinessList") as! BusinessListController
            controller.addJobMode = true
            AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
            
        } else {
            
            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "LocationList") as! BusinessDetailController
            controller.addJobMode = true
            controller.businessId = AppData.user.businesses[0] as! NSNumber
            navigationController?.pushViewController(controller, animated: true)
            
        }
    }
    
}

extension SelectJobController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let job = data[indexPath.row] as! Job
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "JobCell", for: indexPath) as! JobCell
        
        cell.setData(job)
        cell.setOpacity(job.status==jobActive ? 1 : 0.5)
        cell.isUserInteractionEnabled = job.status==jobActive
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        return cell
    }
    
}

extension SelectJobController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let job = data[indexPath.row] as! Job
        if SideMenuController.currentID == "find_talent" {
            SwipeController.pushController(job: job)
        } else {
            ApplicationListController.pushController(job: job, mode: SideMenuController.currentID)
        }
    }
    
}
