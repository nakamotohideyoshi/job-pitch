//
//  InterviewListController.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/27/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class InterviewListController: MJPController {
    @IBOutlet weak var emptyView: UILabel!
    @IBOutlet weak var jobTitleView: UILabel!
    @IBOutlet weak var tableView: UITableView!
    
    var job: Job!
    var jobSeeker: JobSeeker!
    var applications: NSMutableArray! = NSMutableArray()
    
    var data: NSMutableArray! = NSMutableArray()
    var interviews: [Interview]! = [Interview]()
    
    var refresh = true
    
    override func viewDidLoad() {
        super.viewDidLoad()
        emptyView.isHidden = true
        
        jobTitleView.text = String(format: "%@, (%@)", job.title, job.getBusinessName())
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        if refresh {
            refresh = false
            showLoading()
            loadApplications()
        }
    }
    
    func loadApplications() {
        API.shared().loadApplicationsForJob(jobId: job?.id, status: nil, shortlisted: false, success: { (data) in
            self.applications = data.mutableCopy() as! NSMutableArray
            self.loadInterviews()
        }, failure: self.handleErrors)
    }
    
    func loadInterviews() {
        API.shared().loadInterviews(success: { (data) in
            self.hideLoading()
            
            var isEmpty = true
            var applicationIds: [NSNumber]! = [NSNumber]()
            for application in self.applications as! [Application] {
                applicationIds.append(application.id)
            }
            
            self.data = data.mutableCopy() as! NSMutableArray
            self.interviews = []
            
            self.interviews = [Interview]()
            for interview in data as! [Interview] {
                if applicationIds.contains(interview.application) {
                    self.interviews.append(interview)
                    isEmpty = false
                }
            }
            
            self.emptyView.isHidden = !isEmpty
            self.tableView.reloadData()
        }, failure: self.handleErrors)
    }

}


extension InterviewListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return interviews.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let interview = interviews[indexPath.row]
        let cell = tableView.dequeueReusableCell(withIdentifier: "InterviewCell", for: indexPath) as! InterviewCell
        
        for application in self.applications as! [Application] {
            if application.id == interview.application {
                cell.setData(interview, application, job)
                break
            }
        }
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        return cell
        
    }
    
}

extension InterviewListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        refresh = true
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "InterviewDetail") as! InterviewDetailController
        controller.interviewId = interviews[indexPath.row].id
        controller.job = job
        for application in self.applications as! [Application] {
            if application.id == interviews[indexPath.row].application {
                controller.application = application
                navigationController?.pushViewController(controller, animated: true)
                break
            }
        }
        
    }
    
}
