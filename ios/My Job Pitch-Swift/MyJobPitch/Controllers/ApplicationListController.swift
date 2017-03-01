//
//  ApplicationListController.swift
//  MyJobPitch
//
//  Created by dev on 12/26/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import SVPullToRefresh
import MGSwipeTableCell

class ApplicationListController: SearchController {
    
    @IBOutlet weak var emptyView: UILabel!
    
    var isRecruiter = false
    var isApplication = false
    var isConnectBtn = false
    var isShortlisted = false
    
    var searchJob: Job!
    var mode = ""   // if "", applications
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        navigationItem.title = SideMenuController.getCurrentTitle(mode)
        
        isRecruiter = AppData.user.isRecruiter()
        isApplication = mode == "" || mode == "applications"
        isConnectBtn = isRecruiter && isApplication
        isShortlisted = mode == "shortlist"
        
        if isShortlisted {
            emptyView.text = "You have not shortlisted any applications for this job, turn off shortlist view to see the non-shortlisted applications."
        } else if isConnectBtn {
            emptyView.text = "You have not chosen anyone to connect with for this job. Once that happens, you will be able to sort through them from here. You can switch to search mode to look for potential applicants."
        } else if isRecruiter {
            emptyView.text = "No candidates have applied for this job yet. Once that happens, their applications will appear here."
        } else {
            emptyView.text = ""
        }
        
        tableView.addPullToRefresh {
            self.getData()
        }
        
        tableView.triggerPullToRefresh()
        
    }
    
    func getData() {
        
        var status: NSNumber!
        if isRecruiter {
            let statusName = isApplication ? ApplicationStatus.APPLICATION_CREATED: ApplicationStatus.APPLICATION_ESTABLISHED
            status = AppData.getApplicationStatusByName(statusName).id
        }
        
        API.shared().loadApplicationsForJob(jobId: searchJob?.id, status: status, shortlisted: isShortlisted, success: { (data) in
            self.allData = NSMutableArray()
            for application in data as! [Application] {
                if (status == nil || status == application.status) && (!self.isShortlisted || application.shortlisted == self.isShortlisted) {
                    self.allData.add(application)
                }
            }
            self.data = self.allData
            self.emptyView.isHidden = self.allData.count > 0            
            self.tableView.reloadData()
            self.tableView.pullToRefreshView.stopAnimating()
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
        
    }
    
    override func filterItem(item: Any, text: String) -> Bool {
        
        let application = item as! Application
        let businessName = application.job.locationData.businessData.name + ", " + application.job.locationData.name
        
        if isRecruiter {
            let name = application.jobSeeker.firstName + " " + application.jobSeeker.lastName
            return  name.lowercased().contains(text) ||
                    application.job.title.lowercased().contains(text) ||
                    businessName.lowercased().contains(text) ||
                    application.job.locationData.placeName.lowercased().contains(text)
        }
        
        return  application.job.title.lowercased().contains(text) ||
                businessName.lowercased().contains(text) ||
                application.job.locationData.placeName.lowercased().contains(text)
        
    }
    
    static func pushController(job: Job!, mode: String!) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "ApplicationList") as! ApplicationListController
        controller.searchJob = job
        controller.mode = mode
        AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
    }
    
}

extension ApplicationListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let application = data[indexPath.row] as! Application
        
        var cell: MGSwipeTableCell!
        if isRecruiter {
            let cell2 = tableView.dequeueReusableCell(withIdentifier: "ApplicationCell2", for: indexPath) as! ApplicationCell2
            cell2.setData(application)
            cell = cell2
        } else {
            let cell1 = tableView.dequeueReusableCell(withIdentifier: "ApplicationCell1", for: indexPath) as! ApplicationCell1
            cell1.setData(application.job)
            cell = cell1
        }
        
        let applyIcon = isConnectBtn ? "connect-big-icon" : "message-big-icon"
        
        cell.leftButtons = [
            MGSwipeButton(title: "",
                          icon: UIImage(named: applyIcon),
                          backgroundColor: AppData.greenColor,
                          padding: 20,
                          callback: { (cell) -> Bool in
                            
                            self.selectedItem = application
                            
                            if self.isConnectBtn {
                                PopupController.showYellow("Are you sure you want to connect this application?", ok: "Connect", okCallback: {
                                    cell.hideSwipe(animated: true)
                                    AppHelper.showLoading("Connecting...")
                                    self.apply()
                                }, cancel: "Cancel", cancelCallback: {
                                    cell.hideSwipe(animated: true)
                                })
                            } else {
                                cell.hideSwipe(animated: true)
                                self.apply()
                            }
                            
                            return false
            })
        ]
        
        if AppData.user.isRecruiter() {
            
            cell.rightButtons = [
                MGSwipeButton(title: "",
                              icon: UIImage(named: "delete-big-icon"),
                              backgroundColor: AppData.yellowColor,
                              padding: 20,
                              callback: { (cell) -> Bool in
                                
                                PopupController.showYellow("Are you sure you want to delete this application?", ok: "Delete", okCallback: {
                                    self.selectedItem = application
                                    cell.hideSwipe(animated: true)
                                    self.remove()
                                }, cancel: "Cancel", cancelCallback: {
                                    cell.hideSwipe(animated: true)
                                })
                                
                                return false
                })
            ]
            
        }
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        return cell
        
    }
    
}

extension ApplicationListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let application = data[indexPath.row] as! Application
        self.selectedItem = application
        
        if isRecruiter {
            
            JobSeekerDetailController.pushController(jobSeeker: application.jobSeeker,
                                                     application: application,
                                                     job: application.job,
                                                     chooseDelegate: self)
        } else {
            
            ApplicationDetailController.pushController(job: application.job,
                                               application: application,
                                               chooseDelegate: self)
        }
        
    }
    
}

extension ApplicationListController: ChooseDelegate {
    
    func apply() {
        
        if isConnectBtn {
            
            let update = ApplicationStatusUpdate()
            update.id = (self.selectedItem as! Application).id
            update.status = AppData.getApplicationStatusByName(ApplicationStatus.APPLICATION_ESTABLISHED).id
            
            API.shared().updateApplicationStatus(update: update, success: { (data) in
                AppHelper.hideLoading()
                self.tableView.triggerPullToRefresh()
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
            
        } else {
            
            MessageController0.showModal(application: selectedItem as! Application)
            
        }
        
    }
    
    func remove() {
        
        AppHelper.showLoading("Deleting...")
        
        let application = self.selectedItem as! Application
        
        API.shared().deleteApplication(id: application.id, success: {
            AppHelper.hideLoading()
            self.removeItem(self.selectedItem)
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
        
    }
    
}
