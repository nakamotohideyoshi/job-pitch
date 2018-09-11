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
    @IBOutlet weak var firstCreateMessage: UIButton!
    
    var data: NSMutableArray! = NSMutableArray()
    
    var isFirstCreate = false
    var location: Location!
    
    var refresh = true
    
    override func viewDidLoad() {
        super.viewDidLoad()

        tableView.addPullToRefresh {
            self.loadJobs()
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        if refresh {
            refresh = false
            showLoading()
            API.shared().loadLocation(id: location.id, success: { (data) in
                self.location = data as! Location
                self.updateLocationInfo()
                self.loadJobs()
            }, failure: self.handleErrors)
        }
    }
    
    func loadJobs() {
        API.shared().loadJobsForLocation(locationId: location?.id, success: { (data) in
            self.hideLoading()
            self.data = data.mutableCopy() as! NSMutableArray
            self.updateJobList()
            self.tableView.pullToRefreshView.stopAnimating()
        }, failure: self.handleErrors)
    }
    
    func updateLocationInfo() {
        AppHelper.loadLogo(image: location.getImage(), imageView: imgView, completion: nil)
        nameLabel.text = location.name
    }
    
    func updateJobList() {
        subTitle.text = String(format: "Includes %lu %@", data.count, data.count > 1 ? "jobs" : "job")
        firstCreateMessage.isHidden = !isFirstCreate
        emptyView.isHidden = isFirstCreate || self.data.count > 0
        tableView.reloadData()
    }
    
    @IBAction func editLocationAction(_ sender: Any) {
        refresh = true
        LocationEditController.pushController(business: nil, location: location)
    }
    
    @IBAction func deleteLocationAction(_ sender: Any) {
        let message = String(format: "Are you sure you want to delete %@", location.name)
        PopupController.showYellow(message, ok: "Delete", okCallback: {
            
            let jobCount = self.location.jobs.count
            if jobCount == 0 {
                self.deleteWorkplace()
                return
            }
            
            let message1 = String(format: "Deleting this workplace will also delete %d jobs. If you want to hide the jobs instead you can deactive them.", jobCount)
            PopupController.showYellow(message1, ok: "Delete", okCallback: {
                self.deleteWorkplace()
            }, cancel: "Cancel", cancelCallback: nil)
            
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func addJobAction(_ sender: Any) {
        refresh = true
        isFirstCreate = false
        JobEditController.pushController(location: location, job: nil)
    }
    
    func deleteWorkplace() {
        self.showLoading()
        API.shared().deleteLocation(id: location.id, success: {
            self.hideLoading()
            _ = self.navigationController?.popViewController(animated: true)
        }, failure: self.handleErrors)
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
        
        cell.rightButtons = [
            MGSwipeButton(title: "",
                          icon: UIImage(named: "delete-big-icon"),
                          backgroundColor: AppData.yellowColor,
                          padding: 20,
                          callback: { (cell) -> Bool in
                            
                            let message = String(format: "Are you sure you want to delete %@", job.title)
                            PopupController.showYellow(message, ok: "Delete", okCallback: {
                                
                                self.showLoading()
                                
                                API.shared().deleteJob(id: job.id, success: {
                                    self.hideLoading()
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
                            self.refresh = true
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
        refresh = true
        
        let controller = AppHelper.instantiate("JobDetail") as! JobDetailController
        controller.job = data[indexPath.row] as! Job
        navigationController?.pushViewController(controller, animated: true)
    }
    
}
