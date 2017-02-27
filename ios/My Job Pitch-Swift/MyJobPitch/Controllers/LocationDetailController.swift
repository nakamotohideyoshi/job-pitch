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
    
    var location: Location!
    
    var data: NSMutableArray!
    
    var jobActive: NSNumber!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        jobActive = AppData.getJobStatusByName(JobStatus.JOB_STATUS_OPEN).id
        
        updateLocationInfo()
        
        AppHelper.showLoading("Loading...")
        
        data = NSMutableArray()
        API.shared().loadJobsForLocation(locationId: location?.id, success: { (data) in
            AppHelper.hideLoading()
            self.data = data.mutableCopy() as! NSMutableArray
            self.updateJobList(superRefresh: false)
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
    }
    
    func updateLocationInfo() {
        if let image = location.getImage() {
            AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        
        nameLabel.text = location.name
    }
    
    func updateJobList(superRefresh: Bool) {
        if superRefresh {
            BusinessListController.refreshRequest = true
            BusinessDetailController.refreshRequest = true
        }
        subTitle.text = String(format: "Includes %lu %@", data.count, data.count > 1 ? "jobs" : "job")
        emptyView.isHidden = self.data.count > 0
        tableView.reloadData()
    }
    
    @IBAction func editLocationAction(_ sender: Any) {
        LocationEditController.pushController(business: nil, location: location) { (location) in
            BusinessListController.refreshRequest = true
            BusinessDetailController.refreshRequest = true
            self.location = location
            self.updateLocationInfo()
        }
    }
    
    @IBAction func deleteLocationAction(_ sender: Any) {
        let message = String(format: "Are you sure you want to delete %@", location.name)
        PopupController.showYellow(message, ok: "Delete", okCallback: {
            
            AppHelper.showLoading("Deleting...")
            
            API.shared().deleteLocation(id: self.location.id, success: {
                AppHelper.hideLoading()
                BusinessListController.refreshRequest = true
                BusinessDetailController.refreshRequest = true
                _ = self.navigationController?.popViewController(animated: true)
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
            
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func addJobAction(_ sender: Any) {
        JobEditController.pushController(location: location, job: nil, callback: { (job) in
            self.data.add(job)
            self.updateJobList(superRefresh: true)
        })
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
        
        cell.leftButtons = [
            MGSwipeButton(title: "",
                          icon: UIImage(named: "edit-big-icon"),
                          backgroundColor: AppData.greenColor,
                          padding: 20,
                          callback: { (cell) -> Bool in
                            JobEditController.pushController(location: nil, job: job) { (job) in
                                self.data[indexPath.row] = job
                                self.updateJobList(superRefresh: false)
                            }
                            return true
            })
        ]
        
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
                                    self.updateJobList(superRefresh: true)
                                }) { (message, errors) in
                                    self.handleErrors(message: message, errors: errors)
                                }
                                
                                cell.hideSwipe(animated: true)
                                
                            }, cancel: "Cancel", cancelCallback: {
                                cell.hideSwipe(animated: true)
                            })
                            
                            return false
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
