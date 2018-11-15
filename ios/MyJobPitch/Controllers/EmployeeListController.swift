//
//  EmployeeListController.swift
//  MyJobPitch
//
//  Created by bb on 11/5/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class EmployeeListController: MJPController {

    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: EmptyView!
    
    var employees = [Employee]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.addPullToRefresh {
            self.loadData()
        }
        
        showLoading()
        loadData()
    }
    
    func loadData() {
        
        emptyView.isHidden = true
        employees.removeAll()
        var count = 0
        
        for id in AppData.user.employees as! [NSNumber] {
            API.shared().loadEmployee(id) { (result, error) in
                if error != nil {
                    self.showError()
                    return
                }
                
                self.employees.append(result as! Employee)
                
                count = count - 1
                if count == 0 {
                    self.hideLoading()
                    self.tableView.pullToRefreshView.stopAnimating()
                    self.tableView.reloadData()
                }
            }
            
             count = count + 1
        }
    }
    
    func showError() {
        self.hideLoading()
        self.emptyView.setData(message: "Server Error!", button: "Refresh") {
            self.showLoading()
            self.loadData()
        }
    }
}

extension EmployeeListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return employees.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "EmployeeCell", for: indexPath) as! HRJobCell
        let employee = employees[indexPath.row]

        cell.titleLabel.text = employee.job.title
        cell.workplaceLabel.isHidden = true
        cell.drawUnderline()
        
        return cell
    }
}

extension EmployeeListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let controller = EmployeeDetailsController.instantiate()
        controller.employee = employees[indexPath.row]
        navigationController?.pushViewController(controller, animated: true)
    }
}
