//
//  LocationDetailController.swift
//  MyJobPitch
//
//  Created by dev on 12/23/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class LocationDetailController: MJPController {

    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: UIView!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var subTitle: UILabel!
    @IBOutlet weak var controlHeightConstraint: NSLayoutConstraint!
    
    var location: Location!
    
    var data: NSMutableArray! = NSMutableArray()
    
    var jobActive: NSNumber!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        jobActive = AppData.getJobStatusByName(JobStatus.JOB_STATUS_OPEN).id
        
        tableView.addPullToRefresh {
            self.loadJobs()
        }
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        AppHelper.showLoading("Loading...")
        API.shared().loadLocation(id: location.id, success: { (data) in
            self.location = data as! Location
            self.updateLocationInfo()
            self.loadJobs()
        }, failure: self.handleErrors)
    }
    
    func loadJobs() {
        API.shared().loadJobsForLocation(locationId: location?.id, success: { (data) in
            AppHelper.hideLoading()
            self.data = data.mutableCopy() as! NSMutableArray
            self.updateJobList()
            self.tableView.pullToRefreshView.stopAnimating()
        }, failure: self.handleErrors)
    }
    
    func updateLocationInfo() {
        if let image = location.getImage() {
            AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        
        nameLabel.text = location.name
    }
    
    func updateJobList() {
        subTitle.text = String(format: "Includes %lu %@", data.count, data.count > 1 ? "jobs" : "job")
        emptyView.isHidden = self.data.count > 0
        tableView.reloadData()
    }
    
    @IBAction func editLocationAction(_ sender: Any) {
        LocationEditController.pushController(business: nil, location: location)
    }
    
    @IBAction func deleteLocationAction(_ sender: Any) {
        let message = String(format: "Are you sure you want to delete %@", location.name)
        PopupController.showYellow(message, ok: "Delete", okCallback: {
            
            AppHelper.showLoading("Deleting...")
            API.shared().deleteLocation(id: self.location.id, success: {
                AppHelper.hideLoading()
                _ = self.navigationController?.popViewController(animated: true)
            }, failure: self.handleErrors)
            
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func addJobAction(_ sender: Any) {
        JobEditController.pushController(location: location, job: nil)
    }
    
}

extension LocationDetailController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let job = data[indexPath.row] as! Job
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "JobCell", for: indexPath) as! JobCell
        
        cell.setData(job)
        cell.setOpacity(job.status==jobActive ? 1 : 0.5)
        
        cell.rightButtons = [
            MGSwipeButton(title: "",
                          icon: UIImage(named: "delete-big-icon"),
                          backgroundColor: AppData.yellowColor,
                          padding: 20,
                          callback: { (cell) -> Bool in
                            
                            let message = String(format: "Are you sure you want to delete %@", job.title)
                            PopupController.showYellow(message, ok: "Delete", okCallback: {
                                
                                AppHelper.showLoading("Deleting...")                                
                                API.shared().deleteJob(id: job.id, success: {
                                    AppHelper.hideLoading()
                                    self.data.remove(job)
                                    self.updateJobList()
                                }, failure: self.handleErrors)
                                
                                cell.hideSwipe(animated: true)
                                
                            }, cancel: "Cancel", cancelCallback: {
                                cell.hideSwipe(animated: true)
                            })
                            
                            return false
            }),
            MGSwipeButton(title: "",
                          icon: UIImage(named: "edit-big-icon"),
                          backgroundColor: AppData.greenColor,
                          padding: 20,
                          callback: { (cell) -> Bool in
                            JobEditController.pushController(location: nil, job: job)
                            return true
            })
        ]
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        return cell
    }
    
}

extension LocationDetailController: UITableViewDelegate {

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobDetail") as! JobDetailController
        controller.job = data[indexPath.row] as! Job
        navigationController?.pushViewController(controller, animated: true)
    }
    
}
