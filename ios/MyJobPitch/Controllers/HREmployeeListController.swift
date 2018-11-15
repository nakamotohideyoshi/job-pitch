//
//  HREmployeeListController.swift
//  MyJobPitch
//
//  Created by bb on 11/5/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit
import XLPagerTabStrip
import MGSwipeTableCell

class HREmployeeListController: MJPController {
    
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
        if AppData.hrEmployees != nil {
            refreshTable()
        }        
    }
    
    func loadData() {
        self.emptyView.isHidden = true
        
        API.shared().loadHREmployees { (result, error) in
            if error != nil {
                self.showError()
                return
            }
            
            AppData.hrEmployees = result as! [HREmployee]
            
            self.hideLoading()
            self.tableView.pullToRefreshView.stopAnimating()
            self.refreshTable()
        }
    }
    
    func refreshTable() {
        tableView.reloadData()
        if AppData.hrEmployees.count == 0 {
            emptyView.setData(message: "You have no employees.",
                                   button: "Create employee",
                                   action: self.addHREmployee)
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
    
    func addHREmployee() {
        let controller = HREmployeeEditController.instantiate()
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    static func instantiate() -> HREmployeeListController {
        return AppHelper.instantiate("HREmployeeList") as! HREmployeeListController
    }
}

extension HREmployeeListController: IndicatorInfoProvider {
    func indicatorInfo(for pagerTabStripController: PagerTabStripViewController) -> IndicatorInfo {
        return IndicatorInfo(title: "EMPLOYEES")
    }
}

extension HREmployeeListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return AppData.hrEmployees != nil ? AppData.hrEmployees.count : 0
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "HREmployeeCell", for: indexPath) as! ApplicationCell
        let employee = AppData.hrEmployees[indexPath.row]
        
        cell.infoView.titleLabel.text = employee.getFullName()
        if let avatar = employee.profileThumb {
            AppHelper.loadImageURL(imageUrl: avatar, imageView: cell.infoView.imgView, completion: nil)
        } else {
            cell.infoView.imgView.image = UIImage(named: "avatar")
        }
        cell.infoView.subTitleLabel.text = employee.email
        
        cell.drawUnderline()

        cell.rightButtons = [
            MGSwipeButton(title: "",
                          icon: UIImage(named: "delete-big-icon"),
                          backgroundColor: AppData.yellowColor,
                          padding: 20,
                          callback: { (cell) -> Bool in

                            PopupController.showYellow("Are you sure you want to delete this employee?", ok: "Delete", okCallback: {
                                
                                self.showLoading()
                                
                                API.shared().deleteHREmployee(employee.id) { error in
                                    if error != nil {
                                        self.showError()
                                        return
                                    }
                                    
                                    AppData.hrEmployees.remove(at: indexPath.row)
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

extension HREmployeeListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let controller = HREmployeeEditController.instantiate()
        controller.employee = AppData.hrEmployees[indexPath.row]
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
}
