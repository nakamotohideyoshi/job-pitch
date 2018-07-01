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
    @IBOutlet weak var noPitchView: UIView!
    @IBOutlet weak var jobTitleView: UILabel!
    
    var isRecruiter = false
    var isApplication = false
    var isConnectBtn = false
    var isShortlisted = false
    var isRefresh = true
    
    var jobSeeker: JobSeeker!
    
    var job: Job!
    var mode = ""   // if "", applications
    
    var status: NSNumber!
    
    static var refreshRequest = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        navigationItem.title = SideMenuController.getCurrentTitle(mode)
        
        isRecruiter = AppData.user.isRecruiter()
        isApplication = mode == "" || mode == "applications" || mode == "applications1"
        isConnectBtn = isRecruiter && isApplication
        isShortlisted = mode == "shortlist"
        
        if isShortlisted {
            emptyView.text = "You have not shortlisted any applications for this job, turn off shortlist view to see the non-shortlisted applications."
        } else if isConnectBtn {
            emptyView.text = "No applications at the moment. Once thet happens you cant go trough them here and shortlist\nif needed, you can easy switch to Find Talent mode and \"head hunt\" as well."
        } else if isRecruiter {
            emptyView.text = "No candidates have applied for this job yet. Once that happens, their applications will appear here."
        } else {
            emptyView.text = "You have no applications."
        }
        
        if isRecruiter {
            let item = UIBarButtonItem(barButtonSystemItem: .compose, target: self, action: #selector(goJobDetail))
            searchItems?.append(item)
            navigationItem.rightBarButtonItems = searchItems
            jobTitleView.text = job.title + ", (" + job.getBusinessName() + ")"
        } else {
            let item = UIBarButtonItem(barButtonSystemItem: .compose, target: self, action: #selector(self.goProfile))
            self.searchItems?.append(item)
            self.navigationItem.rightBarButtonItems = self.searchItems
            if (jobSeeker != nil) {
                showInactiveBanner()
            }
            if (AppData.newMessagesCount > 0) {
                let item1 = UIBarButtonItem(title: "All Messages", style: .plain, target: self, action: #selector(goAllMessageList))
                var fileName: String!
                if (AppData.newMessagesCount<10) {
                    fileName =  "nav-message\(AppData.newMessagesCount)"
                } else {
                    fileName = "nav-message10"
                }
                item1.image = UIImage(named: fileName)
                navigationItem.rightBarButtonItems?.append(item1)
            }
        }
        
        tableView.addPullToRefresh {
            self.loadData()
        }
        
        if isRecruiter {
            let statusName = isApplication ? ApplicationStatus.APPLICATION_CREATED: ApplicationStatus.APPLICATION_ESTABLISHED
            status = AppData.getApplicationStatusByName(statusName).id
        }
        
        ApplicationListController.refreshRequest = true
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        if ApplicationListController.refreshRequest {
            ApplicationListController.refreshRequest = false
            showLoading()
            
            if !isRecruiter {
                API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
                    self.jobSeeker = data as! JobSeeker
                    
                    self.showInactiveBanner()
                    
                    if self.jobSeeker.getPitch() != nil {
                        self.loadData()
                    } else {
                        self.noPitchView.isHidden = false
                        self.navigationItem.rightBarButtonItem = nil
                        self.hideLoading()
                    }
                }, failure: self.handleErrors)
            } else {
                loadData()
            }
        }
    }
    
    func goAllMessageList() {
        SideMenuController.pushController(id: "messages")
    }
    
    func showInactiveBanner () {
        if !jobSeeker.active {
            self.jobTitleView.text = "Your profile is not active!"
        } else {
            self.jobTitleView.text = ""
        }
    }
    
    func loadData() {
        
        API.shared().loadApplicationsForJob(jobId: job?.id, status: status, shortlisted: isShortlisted, success: { (data) in
            self.hideLoading()
            self.allData = NSMutableArray()
            for application in data as! [Application] {
                if (self.status == nil || self.status == application.status) && (!self.isShortlisted || application.shortlisted == self.isShortlisted) {
                    self.allData.add(application)
                }
            }
            self.filter()
            self.emptyView.isHidden = self.allData.count > 0
            self.tableView.pullToRefreshView.stopAnimating()
        }, failure: self.handleErrors)
        
    }
    
    func goJobDetail(_ sender: Any) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobDetail") as! JobDetailController
        controller.job = job
        navigationController?.pushViewController(controller, animated: true)
    }
    
    func goProfile(_ sender: Any) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobSeekerProfile") as! JobSeekerProfileController
        controller.activation = true
        AppHelper.getFrontController().navigationController?.present(controller, animated: true)
        ApplicationListController.refreshRequest = true
    }
    
    override func filterItem(item: Any, text: String) -> Bool {
        
        let application = item as! Application
        let businessName = application.job.getBusinessName()
        
        if isRecruiter {
            let name = application.jobSeeker.getFullName()
            return  name.lowercased().contains(text) ||
                    application.job.title.lowercased().contains(text) ||
                    businessName.lowercased().contains(text) ||
                    application.job.locationData.placeName.lowercased().contains(text)
        }
        
        return  application.job.title.lowercased().contains(text) ||
                businessName.lowercased().contains(text) ||
                application.job.locationData.placeName.lowercased().contains(text)
        
    }
    
    @IBAction func goRecordNow(_ sender: Any) {
        SideMenuController.pushController(id: "add_record")
    }
    
    
    static func pushController(job: Job!, mode: String!) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "ApplicationList") as! ApplicationListController
        controller.job = job
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
        
        var buttons = [
            MGSwipeButton(title: "",
                          icon: UIImage(named: applyIcon),
                          backgroundColor: AppData.greenColor,
                          padding: 20,
                          callback: { (cell) -> Bool in
                            
                            self.selectedItem = application
                            
                            if self.isConnectBtn {
                                PopupController.showYellow("Are you sure you want to connect this application?", ok: "Connect (1 credit)", okCallback: {
                                    self.apply(callback: {
                                        self.showLoading()
                                        cell.hideSwipe(animated: true)
                                        self.loadData()
                                    })
                                }, cancel: "Cancel", cancelCallback: nil)
                            } else {
                                ApplicationListController.refreshRequest = true
                                MessageController0.showModal(application: self.selectedItem as! Application)
                            }
                            
                            return false
            })
        ];
        
        if AppData.user.isRecruiter() {
            buttons.insert(
                MGSwipeButton(title: "",
                              icon: UIImage(named: "delete-big-icon"),
                              backgroundColor: AppData.yellowColor,
                              padding: 20,
                              callback: { (cell) -> Bool in
                                
                                PopupController.showYellow("Are you sure you want to delete this application?", ok: "Delete", okCallback: {
                                    self.selectedItem = application
                                    cell.hideSwipe(animated: true)
                                    self.remove()
                                }, cancel: "Cancel", cancelCallback: nil)
                                
                                return false
                }), at: 0
            )
            
        }
        
        cell.rightButtons = buttons
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        return cell
        
    }
    
}

extension ApplicationListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        ApplicationListController.refreshRequest = true
        
        let application = data[indexPath.row] as! Application
        self.selectedItem = application
        
        if isRecruiter {
            
            JobSeekerDetailController.pushController(jobSeeker: nil,
                                                     job: nil,
                                                     application: application,
                                                     chooseDelegate: self)
        } else {
            
            ApplicationDetailsController.pushController(job: nil,
                                               application: application,
                                               chooseDelegate: self)
        }
        
    }
    
}

extension ApplicationListController: ChooseDelegate {
    
    func apply(callback: (()->Void)!) {
        
        let update = ApplicationStatusUpdate()
        update.id = (self.selectedItem as! Application).id
        update.status = AppData.getApplicationStatusByName(ApplicationStatus.APPLICATION_ESTABLISHED).id
        
        showLoading()
        API.shared().updateApplicationStatus(update: update, success: { (data) in
            self.hideLoading()
            if callback != nil {
                callback()
            }
        }) { (message, errors) in
            if errors?["NO_TOKENS"] != nil {
                PopupController.showGray("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.", ok: "Ok")
            } else {
                self.handleErrors(message: message, errors: errors)
            }
        }
    }
    
    func remove() {
        
        showLoading()
        
        let application = self.selectedItem as! Application
        
        API.shared().deleteApplication(id: application.id, success: {
            self.hideLoading()
            self.removeItem(self.selectedItem)
        }, failure: self.handleErrors)
        
    }
    
}
