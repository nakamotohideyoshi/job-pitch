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
    
    @IBOutlet weak var tableView: UITableView!
    
    @IBOutlet weak var headerView: UIView!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var titleView: UILabel!
    
    @IBOutlet weak var emptyView: UILabel!
    
    
    var allData: NSMutableArray!
    var data: NSMutableArray!
    
    var jobActive: NSNumber!
    
    var titles = [
        "find_talent":  "Select job bellow to start finding talent for your business.",
        "applications": "application ...",
        "connections":  "connections ...",
        "shortlist":    "shortlist ...",
    ]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        var item = SideMenuController.menuItems[SideMenuController.currentID]!
        imgView.image = UIImage(named: item["icon"]!)?.withRenderingMode(.alwaysTemplate)
        titleView.text = titles[SideMenuController.currentID]
        
        jobActive = AppData.getJobStatusByName(JobStatus.JOB_STATUS_OPEN).id
        
        data = NSMutableArray();
        
        refresh()
        
    }
    
    func refresh() {
        
        AppHelper.showLoading("Loading...")
        
        API.shared().loadJobsForLocation(locationId: nil, success: { (data) in
            AppHelper.hideLoading()
            self.allData = data.mutableCopy() as! NSMutableArray
            self.data = self.allData
            self.emptyView.isHidden = self.allData.count > 0
            self.tableView.reloadData()
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
        
    }
    
//    override func filterItem(item: Any, text: String) -> Bool {
//        
//        let job  = item as! Job
//        let businessName = job.locationData.businessData.name + ", " + job.locationData.name
//        return  job.title.lowercased().contains(text) ||
//            businessName.lowercased().contains(text) ||
//            job.locationData.placeName.lowercased().contains(text)
//        
//    }
    
    @IBAction func jobAddAction(_ sender: Any) {
        SideMenuController.pushController(id: "businesses")
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
