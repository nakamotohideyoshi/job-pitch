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

class ApplicationListController: MJPController {
    
    @IBOutlet weak var emptyView: UILabel!
    @IBOutlet weak var tableView: UITableView!
    
    var applications: [Application] = [Application]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.addPullToRefresh {
            self.loadData()
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        loadData()
    }
    
    func loadData() {
        applications = AppData.applications
        tableView.reloadData()
        tableView.pullToRefreshView.stopAnimating()
        emptyView.isHidden = applications.count > 0
    }

}

extension ApplicationListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return applications.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "ApplicationCell", for: indexPath) as! ApplicationCell
        let application = applications[indexPath.row]
        
        AppHelper.loadLogo(image: application.job.getImage(), imageView: cell.imgView, completion: nil)
        cell.titleLabel.text = application.job.title
        cell.subTitleLabel.text = application.job.getBusinessName()
        if let interview = AppHelper.getInterview(application) {
            let subTitle = "Interview: " + AppHelper.convertDateToString(interview.at, short: false)
            let subTitleParameters = [NSForegroundColorAttributeName : interview.status == InterviewStatus.INTERVIEW_PENDING ? AppData.yellowColor : AppData.greenColor, NSFontAttributeName : UIFont.systemFont(ofSize: 12)]
            cell.attributesLabel.attributedText = NSMutableAttributedString(string: subTitle, attributes: subTitleParameters)
            cell.attributesLabel.isHidden = false
        } else {
            cell.attributesLabel.isHidden = true
        }
        cell.addUnderLine(paddingLeft: 12, paddingRight: 0, color: AppData.greyColor)
        
        cell.rightButtons = [
            MGSwipeButton(title: "",
                          icon: UIImage(named: "message-big-icon"),
                          backgroundColor: AppData.greenColor,
                          padding: 20,
                          callback: { (cell) -> Bool in
                            
                            let controller = MessageController0.instantiate()
                            controller.application = application
                            self.present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
                            return false
            })
        ];
        
        return cell
    }
    
}

extension ApplicationListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let controller = ApplicationDetailsController.instantiate()
        controller.application = applications[indexPath.row]
        navigationController?.pushViewController(controller, animated: true)
    }
}

