//
//  SelectJobController.swift
//  MyJobPitch
//
//  Created by dev on 12/23/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class SelectJobController: SearchController {
    
    var jobActive: NSNumber!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        jobActive = AppData.getJobStatusByName(JobStatus.JOB_STATUS_OPEN).id
        refresh()
        
        
    }
    
    func refresh() {
        
        AppHelper.showLoading("Loading...")
        
        API.shared().loadJobsForLocation(locationId: nil, success: { (data) in
            AppHelper.hideLoading()
            self.allData = data.mutableCopy() as! NSMutableArray
            self.data = self.allData
            self.tableView.reloadData()
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
        
    }
    
    override func filterItem(item: Any, text: String) -> Bool {
        
        let job  = item as! Job
        let businessName = job.locationData.businessData.name + ", " + job.locationData.name
        return  job.title.lowercased().contains(text) ||
            businessName.lowercased().contains(text) ||
            job.locationData.placeName.lowercased().contains(text)
        
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
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Swipe") as! SwipeController
        controller.searchJob = job
        navigationController?.pushViewController(controller, animated: true)
        
    }
    
}
