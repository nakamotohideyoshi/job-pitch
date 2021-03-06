//
//  JobDetailsController.swift
//  MyJobPitch
//
//  Created by dev on 2/27/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

class JobDetailsController: MJPController {

    @IBOutlet weak var infoView: AppInfoSmallView!
    @IBOutlet weak var editRemoveView: EditRemoveView!
    @IBOutlet weak var toolbar: SmallToolbar!
    @IBOutlet weak var tableView: UITableView!
    
    public var job: Job!
    
    var menuItems = [ "find_talent", "applications", "applications", "applications", "interviews" ]
    var titles = [ NSLocalizedString("Find Talent", comment: ""),
                   NSLocalizedString("New Applications", comment: ""),
                   NSLocalizedString("My Connections", comment: ""),
                   NSLocalizedString("My Shortlist", comment: ""),
                   NSLocalizedString("Interviews", comment: "") ]
    var counts = [ "", "", "", "", "" ]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        editRemoveView.editCallback = {
            let controller = JobEditController.instantiate()
            controller.job = self.job
            self.present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
        }
        
        editRemoveView.removeCallback = {
            let message = String(format: NSLocalizedString("Are you sure you want to delete %@", comment: ""), self.job.title)
            PopupController.showYellow(message, ok: NSLocalizedString("Delete", comment: ""), okCallback: {
                
                self.showLoading()
                AppData.removeJob(self.job) { error in
                    if error == nil {
                        _ = self.navigationController?.popViewController(animated: true)
                    } else {
                        self.handleError(error)
                    }                    
                }
                
            }, cancel: NSLocalizedString("Cancel", comment: ""), cancelCallback: nil)
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        updateData()
    }
    
    func updateData() {
        
        job = (AppData.jobs.filter { $0.id == job.id })[0]
        infoView.job = self.job
        
        let applications = AppData.applications.filter { $0.job.id == job.id && $0.status == ApplicationStatus.APPLICATION_CREATED_ID }
        let connections = AppData.applications.filter { $0.job.id == job.id && $0.status == ApplicationStatus.APPLICATION_ESTABLISHED_ID }
        let shortlists = connections.filter { $0.shortlisted }
        
        counts[1] = " (\(applications.count))"
        counts[2] = " (\(connections.count))"
        counts[3] = " (\(shortlists.count))"
        
        tableView.reloadData()
    }
    
    @IBAction func shareAction(_ sender: Any) {
        let url = String(format: "%@/jobseeker/jobs/%@", API.apiRoot.absoluteString, job.id)
        let itemProvider = ShareProvider(placeholderItem: url)
        let controller = UIActivityViewController(activityItems: [itemProvider], applicationActivities: nil)
        present(controller, animated: true, completion: nil)
    }
    
    static func instantiate() -> JobDetailsController {
        return AppHelper.instantiate("JobDetails") as! JobDetailsController
    }    
}


extension JobDetailsController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return menuItems.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "JobMenuCell", for: indexPath)
        let cellInfoView = cell.viewWithTag(1) as! AppInfoSmallView
        let item = SideMenuController.menuItems[menuItems[indexPath.row]]!
        let text = titles[indexPath.row] + counts[indexPath.row]
        
        cellInfoView.setDescription(icon: item["icon"]!, text: text)
        cellInfoView.imgView.tintColor = UIColor.black
        cell.drawUnderline()
        
        return cell
    }
}

extension JobDetailsController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let id = menuItems[indexPath.row]
        if id == "find_talent" {
            let controller = SwipeController.instantiate()
            controller.searchJob = job
            navigationController?.pushViewController(controller, animated: true)
        } else if id == "interviews" {
            let controller = InterviewListController.instantiate()
            controller.job = job
            navigationController?.pushViewController(controller, animated: true)
        } else if id == "applications" {
            let controller = RCApplicationListController.instantiate()
            controller.job = job
            controller.defaultTab = indexPath.row - 1
            navigationController?.pushViewController(controller, animated: true)
        }
    }
}
