//
//  RCApplicationListController.swift
//  MyJobPitch
//
//  Created by bb on 9/14/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit
import XLPagerTabStrip
import MGSwipeTableCell

class RCApplicationListController: ButtonBarPagerTabStripViewController {
    
    @IBOutlet weak var infoView: AppInfoSmallView!
    
    public var job: Job!
    public var defaultTab: Int = 0
    
    var controllers: [RCApplicationSubListController]!
    var loading: LoadingController!
    
    override func viewDidLoad() {
        
        settings.style.buttonBarLeftContentInset = 12
        settings.style.buttonBarRightContentInset = 12
        settings.style.buttonBarItemBackgroundColor = UIColor.clear
        settings.style.buttonBarItemFont = UIFont.systemFont(ofSize: 12, weight: UIFontWeightSemibold)
        settings.style.buttonBarItemLeftRightMargin = 12
        settings.style.selectedBarBackgroundColor = AppData.greenColor
        settings.style.selectedBarHeight = 3
        settings.style.buttonBarBackgroundColor = AppData.darkColor
        
        super.viewDidLoad()
        
        navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(addApplication))
        
        infoView.job = job
        infoView.touch = {
            let controller = JobDetailController.instantiate()
            controller.job = self.job
            self.navigationController?.pushViewController(controller, animated: true)
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        AppData.appsUpdateCallback = {
            self.reloadData()
        }
        
        reloadData()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)

        if defaultTab != -1 {
            moveToViewController(at: defaultTab,animated: true)
            defaultTab = -1
        }
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)

        AppData.appsUpdateCallback = nil
    }
    
    func reloadData() {
        controllers?.forEach {
            $0.reloadData()
        }
    }
    
    func addApplication() {
        let controller = ApplicationAddController.instantiate()
        controller.job = job
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    override func viewControllers(for pagerTabStripController: PagerTabStripViewController) -> [UIViewController] {
        
        let controller1 = RCApplicationSubListController.instantiate()
        controller1.title = "NEW APPLICATIONS"
        controller1.emptyMsg = "No applications at the moment. Once thet happens you cant go trough them here and shortlist\nif needed, you can easy switch to Find Talent mode and \"head hunt\" as well."
        controller1.job = job
        controller1.status = ApplicationStatus.APPLICATION_CREATED_ID
        
        let controller2 = RCApplicationSubListController.instantiate()
        controller2.title = "MY CONNECTIONS"
        controller2.emptyMsg = "No candidates have applied for this job yet. Once that happens, their applications will appear here."
        controller2.job = job
        controller2.status = ApplicationStatus.APPLICATION_ESTABLISHED_ID
        
        let controller3 = RCApplicationSubListController.instantiate()
        controller3.title = "MY SHORTLIST"
        controller3.emptyMsg = "You have not shortlisted any applications for this job, turn off shortlist view to see the non-shortlisted applications."
        controller3.job = job
        controller3.status = ApplicationStatus.APPLICATION_ESTABLISHED_ID
        controller3.shortlisted = true
        
        controllers = [controller1, controller2, controller3]
        reloadData()
        
        return controllers
    }
    
    static func instantiate() -> RCApplicationListController {
        return AppHelper.instantiate("RCApplicationList") as! RCApplicationListController
    }
}


class RCApplicationSubListController: MJPController, IndicatorInfoProvider {
    
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: UILabel!
    
    public var job: Job!
    public var status: NSNumber!
    public var shortlisted = false
    public var emptyMsg: String!

    var applications = [Application]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        emptyView.text = emptyMsg
        
        tableView.addPullToRefresh {
            self.emptyView.isHidden = true
            self.reloadData()
        }
    }
    
    func reloadData() {
        
        applications = AppData.applications.filter { $0.job.id === job.id && $0.status === status && (!shortlisted || $0.shortlisted) }
        
        if tableView != nil {
            tableView.pullToRefreshView.stopAnimating()
            tableView.reloadData()
            emptyView.isHidden = applications.count > 0
            
            (parent as? ButtonBarPagerTabStripViewController)?.buttonBarView.reloadData()
        }
    }
    
    func updateApplication(_ applicationId: NSNumber) {
        
        AppData.getApplication(applicationId) { (_, error) in
            self.hideLoading()
            if error == nil {
                (self.parent as? RCApplicationListController)?.reloadData()
            }
        }
    }
    
    func indicatorInfo(for pagerTabStripController: PagerTabStripViewController) -> IndicatorInfo {
        return IndicatorInfo(title: String(format: "%@ (%d)", title!, applications.count))
    }
    
    static func instantiate() -> RCApplicationSubListController {
        return AppHelper.instantiate("RCApplicationSubList") as! RCApplicationSubListController
    }
}

extension RCApplicationSubListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return applications.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "RCApplicationCell", for: indexPath) as! RCApplicationCell
        let application = applications[indexPath.row]
        
        cell.infoView.jobSeeker = application.jobSeeker
        cell.infoView.interview = application.getInterview()
        cell.iconView.isHidden = !application.shortlisted
        cell.drawUnderline()
        
        var rightButtons = [
            MGSwipeButton(title: "",
                          icon: UIImage(named: "delete-big-icon"),
                          backgroundColor: AppData.yellowColor,
                          padding: 20,
                          callback: { (cell) -> Bool in

                            PopupController.showYellow("Are you sure you want to delete this application?", ok: "Delete", okCallback: {
                                
                                self.showLoading()
                                
                                API.shared().deleteApplication(application.id) { error in
                                    if error == nil {
                                        self.updateApplication(application.id)
                                    } else {
                                        self.handleError(error)
                                    }
                                }
                                
                            }, cancel: "Cancel", cancelCallback: nil)
                            
                            return false
            })
        ]
        
        if application.messages.count > 0 {
            rightButtons.append(MGSwipeButton(title: "",
                          icon: UIImage(named: status == ApplicationStatus.APPLICATION_CREATED_ID ? "connect-big-icon" : "message-big-icon"),
                          backgroundColor: AppData.greenColor,
                          padding: 20,
                          callback: { (cell) -> Bool in
                            
                            if self.status == ApplicationStatus.APPLICATION_CREATED_ID {
                                PopupController.showYellow("Are you sure you want to connect this application?", ok: "Connect (1 credit)", okCallback: {
                                    
                                    self.showLoading()
                                    
                                    let data = ApplicationStatusUpdate()
                                    data.id = application.id
                                    data.status = ApplicationStatus.APPLICATION_ESTABLISHED_ID
                                    
                                    API.shared().updateApplicationStatus(data) { (_, error) in
                                        if error == nil {
                                            self.updateApplication(application.id)
                                        } else {
                                            self.handleError(error)
                                        }
                                    }
                                    
                                }, cancel: "Cancel", cancelCallback: nil)
                                
                            } else {
                                let controller = MessageController0.instantiate()
                                controller.application = application
                                self.present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
                            }
                            
                            return false
            }))
        }
        
        cell.rightButtons = rightButtons
        
        return cell
    }
}

extension RCApplicationSubListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {

        let controller = JobSeekerDetailController.instantiate()
        controller.application = applications[indexPath.row]
        navigationController?.pushViewController(controller, animated: true)        
    }
    
}
