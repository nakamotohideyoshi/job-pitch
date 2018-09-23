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
    @IBOutlet weak var infoView: AppInfoSmallView!
    @IBOutlet weak var editRemoveView: EditRemoveView!
    @IBOutlet weak var toolbar: SmallToolbar!
    @IBOutlet weak var emptyView: EmptyView!
    
    public var workplace: Location!
    
    var jobs = [Job]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        AppHelper.loadLogo(workplace, imageView: infoView.imgView, completion: nil)
        infoView.titleLabel.text = workplace.name
        
        if !workplace.businessData.restricted {
            editRemoveView.editCallback = editWorkplace
            editRemoveView.removeCallback = removeWorkplace
        }

        toolbar.titleLabel.text = "JOBS"
        toolbar.rightAction = addJob
        
        emptyView.button.setTitle("Create job", for: .normal)
        emptyView.action = addJob
        
        tableView.addPullToRefresh {
            self.loadJobs()
        }
        
        showLoading()
        AppData.jobs = nil
        loadJobs()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if AppData.jobs != nil {
            updateList()
        }        
    }
    
    func loadJobs() {
        AppData.getJobs(locationId: workplace.id, success: {
            self.hideLoading()
            self.tableView.pullToRefreshView.stopAnimating()
            self.updateList()
        }, failure: handleErrors)
    }
    
    func updateList() {
        jobs = AppData.jobs

        let jobCount = jobs.count
        infoView.subTitleLabel.text = String(format: "Includes %lu %@", jobCount, jobCount > 1 ? "jobs" : "job")
        
        emptyView.isHidden = jobs.count > 0
        if UserDefaults.standard.integer(forKey: "tutorial") == 2 {
            emptyView.message.text = "Okay, last step, now tap to create your first job."
        } else {
            emptyView.message.text = "You have not added any jobs yet."
        }
        
        tableView.reloadData()
    }
    
    func editWorkplace() {
        let controller = LocationEditController.instantiate()
        controller.workplace = workplace
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    func removeWorkplace() {
        
        let jobCount = jobs.count
        let message = jobCount == 0 ?
            String(format: "Are you sure you want to delete %@", workplace.name) :
            String(format: "Deleting this workplace will also delete %d jobs. If you want to hide the jobs instead you can deactive them.", jobCount)
        PopupController.showYellow(message, ok: "Delete", okCallback: {
            
            self.showLoading()
            AppData.removeWorkplace(self.workplace.id, success: { () in
                _ = self.navigationController?.popViewController(animated: true)
            }, failure: self.handleErrors)
            
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    func addJob() {
        let controller = JobEditController.instantiate()
        controller.workplace = workplace
        controller.saveComplete = { (job: Job) in
            let controller = JobDetailController.instantiate()
            controller.job = job
            self.navigationController?.pushViewController(controller, animated: true)
        }
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    static func instantiate() -> LocationDetailController {
        return AppHelper.instantiate("JobList") as! LocationDetailController
    }
    
}

extension LocationDetailController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return jobs.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "JobCell", for: indexPath) as! ApplicationCell
        let job = jobs[indexPath.row]
        
        cell.infoView.job = job
        cell.backgroundColor = job.status != JobStatus.JOB_STATUS_OPEN_ID ? AppData.lightGreyColor : UIColor.white
        
        cell.rightButtons = [
            MGSwipeButton(title: "",
                          icon: UIImage(named: "delete-big-icon"),
                          backgroundColor: AppData.yellowColor,
                          padding: 20,
                          callback: { (cell) -> Bool in
                            
                            let message = String(format: "Are you sure you want to delete %@", job.title)
                            PopupController.showYellow(message, ok: "Delete", okCallback: {
                                
                                cell.hideSwipe(animated: true)
                                self.showLoading()
                                AppData.removeJob(job.id, success: {
                                    self.hideLoading()
                                    self.updateList()
                                }, failure: self.handleErrors)
                                
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
                            let controller = JobEditController.instantiate()
                            controller.job = job
                            self.present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
                            return true
            })
        ]
        
        cell.drawUnderline()
        
        return cell
    }
    
}

extension LocationDetailController: UITableViewDelegate {

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let controller = JobDetailController.instantiate()
        controller.job = jobs[indexPath.row]
        navigationController?.pushViewController(controller, animated: true)
    }
}
