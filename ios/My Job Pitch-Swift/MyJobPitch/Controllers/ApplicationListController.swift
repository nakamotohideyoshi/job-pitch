//
//  ApplicationListController1.swift
//  MyJobPitch
//
//  Created by dev on 12/26/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import SVPullToRefresh
import MGSwipeTableCell

class ApplicationListController1: MJPController {
    
    @IBOutlet weak var emptyView: UILabel!
    @IBOutlet weak var noPitchView: UIView!
    @IBOutlet weak var tableView: UITableView!
    
    var data: NSMutableArray!
    var selectedItem: Any!
    
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
        
        title = SideMenuController.menuItems[SideMenuController.currentID]?["title"]
        
        isRecruiter = AppData.user.isRecruiter()
        isApplication = mode == "" || mode == "applications" || mode == "j_applications"
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
            navigationItem.rightBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav-edit"), style: .plain, target: self, action: #selector(goJobDetail))
            setTitle(title: title!, subTitle: job.title + ", (" + job.getBusinessName() + ")")
        } else {
            self.navigationItem.rightBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav-edit"), style: .plain, target: self, action: #selector(goProfile))
            if (jobSeeker != nil) {
                showInactiveBanner()
            }
            navigationItem.rightBarButtonItems?.append(UIBarButtonItem())
        }
        
        tableView.addPullToRefresh {
            self.loadData()
        }
        
        if isRecruiter {
            status = isApplication ? ApplicationStatus.APPLICATION_CREATED_ID: ApplicationStatus.APPLICATION_ESTABLISHED_ID
        }
        
        ApplicationListController1.refreshRequest = true
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        if ApplicationListController1.refreshRequest {
            ApplicationListController1.refreshRequest = false
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
    
    func showInactiveBanner () {
        //        if !jobSeeker.active {
        //            self.jobTitleView.text = "Your profile is not active!"
        //        } else {
        //            self.jobTitleView.text = ""
        //        }
    }
    
    func loadData() {
        
        API.shared().loadApplicationsForJob(jobId: job?.id, status: status, shortlisted: isShortlisted, success: { (data) in
            self.hideLoading()
            self.data = NSMutableArray()
            for application in data as! [Application] {
                if (self.status == nil || self.status == application.status) && (!self.isShortlisted || application.shortlisted == self.isShortlisted) {
                    self.data.add(application)
                }
            }
            self.emptyView.isHidden = self.data.count > 0
            self.tableView.pullToRefreshView.stopAnimating()
        }, failure: self.handleErrors)
        
    }
    
    func goJobDetail(_ sender: Any) {
        let controller = AppHelper.instantiate("JobDetail") as! JobDetailController
        controller.job = job
        navigationController?.pushViewController(controller, animated: true)
    }
    
    func goProfile(_ sender: Any) {
        let controller = JobSeekerProfileController.instantiate()
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
//        ApplicationListController1.refreshRequest = true
    }
    
    @IBAction func goRecordNow(_ sender: Any) {
        SideMenuController.pushController(id: "add_record")
    }
    
    
    static func pushController(job: Job!, mode: String!) {
        let controller = AppHelper.instantiate("ApplicationList") as! ApplicationListController
        controller.job = job
        controller.mode = mode
        AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
    }
    
}

extension ApplicationListController1: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let application = data[indexPath.row] as! Application
        
        let appInterviews = application.interviews as! [ApplicationInterview]
        let filters = appInterviews.filter { $0.status == InterviewStatus.INTERVIEW_PENDING || $0.status == InterviewStatus.INTERVIEW_ACCEPTED }
        let interview = filters.count > 0 ? filters[0] : nil
        
        var cell: MGSwipeTableCell!
        if isRecruiter {
            let cell2 = tableView.dequeueReusableCell(withIdentifier: "ApplicationCell2", for: indexPath) as! ApplicationCell2
            cell2.setData(application)
            if interview != nil {
                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "E d MMM, yyyy"
                let dateFormatter1 = DateFormatter()
                dateFormatter1.dateFormat = "HH:mm"
                cell2.location.text = String(format: "Interview: %@ at %@", dateFormatter.string(from: (interview?.at)!), dateFormatter1.string(from: (interview?.at)!))
            }
            cell = cell2
        } else {
            let cell1 = tableView.dequeueReusableCell(withIdentifier: "ApplicationCell1", for: indexPath) as! ApplicationCell1
            cell1.setData(application.job)
            if interview != nil {
                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "E d MMM, yyyy"
                let dateFormatter1 = DateFormatter()
                dateFormatter1.dateFormat = "HH:mm"
                cell1.desc.text = String(format: "Interview: %@ at %@", dateFormatter.string(from: (interview?.at)!), dateFormatter1.string(from: (interview?.at)!))
            }
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
                                ApplicationListController1.refreshRequest = true
                                let controller = MessageController0.instantiate()
                                controller.application = self.selectedItem as! Application
                                let navController = UINavigationController(rootViewController: controller)
                                self.present(navController, animated: true, completion: nil)
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
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyColor)
        
        return cell
        
    }
    
}

extension ApplicationListController1: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        ApplicationListController1.refreshRequest = true
        
        let application = data[indexPath.row] as! Application
        self.selectedItem = application
        
        if isRecruiter {
            let controller = JobSeekerDetailController.instantiate()
            controller.application = application
            navigationController?.pushViewController(controller, animated: true)
        } else {
            let controller = ApplicationDetailsController.instantiate()
            controller.application = application
            controller.chooseDelegate = self
            navigationController?.pushViewController(controller, animated: true)
        }
        
    }
    
}

extension ApplicationListController1: ChooseDelegate {
    
    func apply(callback: (()->Void)!) {
        
        let update = ApplicationStatusUpdate()
        update.id = (self.selectedItem as! Application).id
        update.status = ApplicationStatus.APPLICATION_ESTABLISHED_ID
        
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
    
    func removeItem(_ item: Any!) {
        
        if item != nil {
            data.remove(item)
            tableView.reloadData()
        }
        
    }
    
}
