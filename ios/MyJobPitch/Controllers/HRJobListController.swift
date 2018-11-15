//
//  HRJobListController.swift
//  MyJobPitch
//
//  Created by bb on 11/5/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit
import XLPagerTabStrip
import MGSwipeTableCell

class HRJobListController: MJPController {
    
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: EmptyView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.addPullToRefresh {
            self.loadData()
        }
        
        showLoading()
        loadData()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if AppData.hrJobs != nil {
            refreshTable()
        }
    }
    
    func loadData() {
        emptyView.isHidden = true
        
        API.shared().loadHRJobs { (result, error) in
            if error != nil {
                self.showError()
                return
            }
            
            AppData.hrJobs = result as! [HRJob]
            
            AppData.getWorkplaces(businessId: nil) { (error) in
                if error != nil {
                    self.showError()
                    return
                }
                
                self.hideLoading()
                self.tableView.pullToRefreshView.stopAnimating()
                self.refreshTable()
            }
        }
    }
    
    func refreshTable() {
        tableView.reloadData()
        if AppData.hrJobs.count == 0 {
            emptyView.setData(message: "You have no jobs.",
                                   button: "Create job",
                                   action: self.addHRJob)
        } else {
            emptyView.isHidden = true
        }
    }
    
    func showError() {
        hideLoading()
        emptyView.setData(message: "Server Error!", button: "Refresh") {
            self.showLoading()
            self.loadData()
        }
    }
    
    func addHRJob() {
        let controller = HRJobEditController.instantiate()
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    static func instantiate() -> HRJobListController {
        return AppHelper.instantiate("HRJobList") as! HRJobListController
    }
}

extension HRJobListController: IndicatorInfoProvider {
    func indicatorInfo(for pagerTabStripController: PagerTabStripViewController) -> IndicatorInfo {
        return IndicatorInfo(title: "JOBS")
    }
}

extension HRJobListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return AppData.hrJobs != nil ? AppData.hrJobs.count : 0
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "HRJobCell", for: indexPath) as! HRJobCell
                let job = AppData.hrJobs[indexPath.row]
        
                cell.titleLabel.text = job.title
                cell.workplaceLabel.text = (AppData.getItemByID(AppData.workplaces, id: job.location) as! Location).name
                cell.drawUnderline()
        
                cell.rightButtons = [
                    MGSwipeButton(title: "",
                                  icon: UIImage(named: "delete-big-icon"),
                                  backgroundColor: AppData.yellowColor,
                                  padding: 20,
                                  callback: { (cell) -> Bool in

                                    PopupController.showYellow("Are you sure you want to delete this job?", ok: "Delete", okCallback: {

                                        self.showLoading()

                                        API.shared().deleteHRJob(job.id) { error in
                                            if error != nil {
                                                self.showError()
                                                return
                                            }
                                            
                                            AppData.hrJobs.remove(at: indexPath.row)
                                            self.hideLoading()
                                            self.tableView.reloadData()
                                        }

                                    }, cancel: "Cancel", cancelCallback: nil)

                                    return false
                    })
                ]
        
        return cell
    }
}

extension HRJobListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let controller = HRJobEditController.instantiate()
        controller.job = AppData.hrJobs[indexPath.row]
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }    
}

