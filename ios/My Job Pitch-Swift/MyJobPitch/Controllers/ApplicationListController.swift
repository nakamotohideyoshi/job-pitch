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
    
    var refreshRequest = false
    
    var isRecruiter = false
    var isApplication = false
    var isConnectBtn = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        navigationItem.title = SideMenuController.getCurrentTitle()
        
        isRecruiter = AppData.user.isRecruiter()
        isApplication = SideMenuController.currentID == "applications"
        isConnectBtn = isRecruiter && isApplication
        
        tableView.addPullToRefresh {
            self.getData()
        }
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        //if refreshRequest {
            refreshRequest = false
            tableView.triggerPullToRefresh()
        //}
        
    }
    
    func getData() {
        
        var status: NSNumber!
        if isRecruiter {
            let statusName = isApplication ? ApplicationStatus.APPLICATION_CREATED: ApplicationStatus.APPLICATION_ESTABLISHED
            status = AppData.getApplicationStatusByName(statusName).id
        }
        
        let shortlisted = SideMenuController.currentID == "shortlist"
        
        API.shared().loadApplicationsForJob(jobId: nil, status: status, shortlisted: shortlisted, success: { (data) in
            self.allData = NSMutableArray()
            for application in data as! [Application] {
                if (status == nil || status == application.status) && (!shortlisted || application.shortlisted == shortlisted) {
                    self.allData.add(application)
                }
            }
            self.data = self.allData
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
                                                     chooseDelegate: self)
        } else {
            
            JobDetailController.pushController(job: application.job,
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
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
            
        } else {
            
            MessageController.showModal(application: selectedItem as! Application)
            
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
