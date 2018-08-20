//
//  ApplicationInterviewListController.swift
//  MyJobPitch
//
//  Created by TIGER1 on 8/20/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class ApplicationInterviewListController: MJPController {

    @IBOutlet weak var emptyView: UILabel!
    @IBOutlet weak var jobTitleView: UILabel!
    @IBOutlet weak var tableView: UITableView!
    
    var application: Application!
    var interviews: [ApplicationInterview]! = [ApplicationInterview]()
    
    var refresh = true
    
    override func viewDidLoad() {
        super.viewDidLoad()
        emptyView.isHidden = true
        if AppData.user.isRecruiter() {
            jobTitleView.text = String(format: "%@, (%@)", application.job.title, application.job.getBusinessName())
        } else  {
            jobTitleView.text = ""
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        loadInterviews()
    }
    
    func loadInterviews() {
        for interview in application.interviews as! [ApplicationInterview] {
            self.interviews.append(interview)
        }
        tableView.reloadData()
    }

}

extension ApplicationInterviewListController: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return application.interviews.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let interview = application.interviews[indexPath.row] as! ApplicationInterview
        let cell = tableView.dequeueReusableCell(withIdentifier: "ApplicationInterviewCell", for: indexPath) as! ApplicationInterviewCell
        
        cell.setData(interview, application)
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        return cell
    }
    
}

extension ApplicationInterviewListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
    }
    
}


