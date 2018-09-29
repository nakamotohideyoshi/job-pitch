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
    var interviews: [(Application, Interview)]! = [(Application, Interview)]()
    
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
        
        AppData.appsUpdateCallback = {
            self.loadData()
        }
        
        loadData()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        AppData.appsUpdateCallback = nil
    }
    
    func loadData() {
        interviews.removeAll()
        for application in AppData.applications {
            if (job == nil || job.id == application.job.id) && application.status == ApplicationStatus.APPLICATION_ESTABLISHED_ID {
                if let interview = application.getInterview() {
                    interviews.append((application, interview))
                } else if application.interviews.count > 0 {
                    interviews.append((application, application.interviews.lastObject as! Interview))
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
        
        cell.application = application
        cell.interview = interview
        cell.drawUnderline()
        
        return cell
    }
}

extension InterviewListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let controller = InterviewDetailController.instantiate()
        controller.application = interviews[indexPath.row].0
        navigationController?.pushViewController(controller, animated: true)
    }
}
