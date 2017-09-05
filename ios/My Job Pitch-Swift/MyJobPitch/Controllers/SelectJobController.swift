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
        showLoading()
        refresh()
    }
    
    func refresh() {
        API.shared().loadJobsForLocation(locationId: nil, success: { (data) in
            self.hideLoading()
            self.data = data.mutableCopy() as! NSMutableArray
            self.emptyView.isHidden = self.data.count > 0
            self.tableView.reloadData()
            self.tableView.pullToRefreshView.stopAnimating()
        }, failure: self.handleErrors)        
    }
    
    @IBAction func jobAddAction(_ sender: Any) {
        
        if AppData.user.canCreateBusinesses || AppData.user.businesses.count==0 {
            
            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "BusinessList") as! BusinessListController
            AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
            
        } else {
            
            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "LocationList") as! BusinessDetailController
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
        cell.isUserInteractionEnabled = job.status==jobActive
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        if job.status == jobActive {
            cell.setOpacity(1)
            cell.backgroundColor = UIColor.white
        } else {
            var str: NSMutableAttributedString =  NSMutableAttributedString(string: cell.nameLabel.text!)
            str.addAttribute(NSFontAttributeName, value: UIFont.italicSystemFont(ofSize: 20), range: NSMakeRange(0, str.length))
            cell.nameLabel.attributedText = str
            
            str =  NSMutableAttributedString(string: cell.subTitle.text!)
            str.addAttribute(NSFontAttributeName, value: UIFont.italicSystemFont(ofSize: 16), range: NSMakeRange(0, str.length))
            cell.subTitle.attributedText = str
            
            cell.setOpacity(0.5)
            cell.backgroundColor = UIColor(red: 240/256.0, green: 240/256.0, blue: 240/256.0, alpha: 0.5)
        }
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
