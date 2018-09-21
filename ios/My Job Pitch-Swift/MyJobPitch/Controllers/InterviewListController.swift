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
    @IBOutlet weak var tableView: UITableView!
    
    public var job: Job!
    
    var jobSeeker: JobSeeker!
    var interviews: [(Application, ApplicationInterview)]! = [(Application, ApplicationInterview)]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        emptyView.isHidden = true
        
        if AppData.user.isRecruiter() {
            let subTitle = String(format: "%@, (%@)", job.title, job.getBusinessName())
            setTitle(title: "Interviews", subTitle: subTitle)
        }
        
        tableView.addPullToRefresh {
            self.loadData()
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        AppData.refreshCallback = {
            self.loadData()
        }
        
        loadData()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        AppData.refreshCallback = nil
    }
    
    func loadData() {
        interviews.removeAll()
        for application in AppData.applications {
            if (job == nil || job.id == application.job.id) && application.status == ApplicationStatus.APPLICATION_ESTABLISHED_ID {
                if let interview = application.getInterview() {
                    interviews.append((application, interview))
                } else if application.interviews.count > 0 {
                    interviews.append((application, application.interviews.lastObject as! ApplicationInterview))
                }
            }
        }
        
        interviews.sort { $0.1.at > $1.1.at }
        
        self.tableView.pullToRefreshView.stopAnimating()
        self.tableView.reloadData()
        self.emptyView.isHidden = interviews.count > 0
    }
    
    static func instantiate() -> InterviewListController {
        return AppHelper.instantiate("InterviewList") as! InterviewListController
    }
}


extension InterviewListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return interviews.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "InterviewCell", for: indexPath) as! InterviewCell
        
        let (application, interview) = interviews[indexPath.row]
        
        if AppData.user.isRecruiter() {
            
            AppHelper.loadPhoto(application.jobSeeker, imageView: cell.imgView, completion: nil)
            cell.name.text = application.jobSeeker.getFullName()
            cell.comment.text = application.jobSeeker.desc
            
        } else {
            AppHelper.loadLogo(application.job, imageView: cell.imgView, completion: nil)
            cell.name.text = application.job.title
            cell.comment.text = application.job.getBusinessName()
        }
        
        if interview.status == InterviewStatus.INTERVIEW_PENDING {
            cell.status.text = AppData.user.isJobSeeker() ? "Interview request received" : "Interview request sent"
        } else if interview.status == InterviewStatus.INTERVIEW_ACCEPTED {
            cell.status.text = "Interview accepted"
        } else if interview.status == InterviewStatus.INTERVIEW_COMPLETED {
            cell.status.text = "This interview is done"
        } else {
            cell.status.text = "Interview cancelled by " + (AppData.user.isRecruiter() ? "Recruiter" : "Jobseeker")
        }
        
        cell.dataTime.text = AppHelper.dateToLongString(interview.at)
        cell.location.text = application.job.locationData.placeName
        
        cell.addUnderLine(paddingLeft: 12, paddingRight: 0, color: AppData.greyColor)
        
        return cell
    }
}

extension InterviewListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let (application, interview) = interviews[indexPath.row]
        let controller = InterviewDetailController.instantiate()
        controller.application = application
        navigationController?.pushViewController(controller, animated: true)
    }
}
