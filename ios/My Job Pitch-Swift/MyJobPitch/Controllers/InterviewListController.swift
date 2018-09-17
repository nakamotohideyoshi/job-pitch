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
    
    var job: Job!
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
        loadData()
    }
    
    func loadData() {
        interviews.removeAll()
        for application in AppData.applications {
            if job == nil || job.id == application.job.id {
                let appInterviews = application.interviews as! [ApplicationInterview]
                let filters = appInterviews.filter { $0.status == InterviewStatus.INTERVIEW_PENDING || $0.status == InterviewStatus.INTERVIEW_ACCEPTED }
                
                if filters.count > 0 {
                    interviews.append((application, filters[0]))
                }
            }
        }
        
        interviews.sort { $0.1.at > $1.1.at }
        
        self.emptyView.isHidden = interviews.count > 0
        self.tableView.reloadData()
        self.tableView.pullToRefreshView.stopAnimating()
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
        cell.setData(application, interview)
        cell.addUnderLine(paddingLeft: 12, paddingRight: 0, color: AppData.greyColor)
        
        return cell
    }
}

extension InterviewListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let (application, interview) = interviews[indexPath.row]
        let controller = InterviewDetailController.instantiate()
        controller.application = application
        controller.interview = interview
        navigationController?.pushViewController(controller, animated: true)
    }
}
