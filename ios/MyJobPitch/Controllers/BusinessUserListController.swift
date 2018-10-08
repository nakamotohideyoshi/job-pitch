//
//  BusinessUserListController.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/21/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class BusinessUserListController: MJPController {
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: UIView!
    
    var business: Business!
    var data: [(BusinessUser, String)]!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setTitle(title: "Users", subTitle: business.name)
        
        tableView.addPullToRefresh {
            self.loadData()
        }
        
        showLoading()
        loadData()
       
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if data != nil {
            updatedData()
        }
    }
    
    func loadData() {
        if business.restricted {
            AppData.businessUsers = []
            updatedData()
            return
        }
        
        AppData.getWorkplaces(businessId: business.id) { error in
            if error != nil {
                self.handleError(error)
                return
            }
            
            AppData.getBusinessUsers(businessId: self.business.id) { error in
                if error == nil {
                    self.updatedData()
                } else {
                    self.handleError(error)
                }
            }
        }
    }
    
    func updatedData() {
        self.hideLoading()
        self.tableView.pullToRefreshView.stopAnimating()
        emptyView.isHidden = AppData.businessUsers.count > 0
        
        data = AppData.businessUsers.map({ (user) -> (BusinessUser, String) in
            var label = ""
            if user.locations.count > 0 {
                let locations = AppData.workplaces.filter { user.locations.contains($0.id) }
                let names: [String] = locations.map { $0.name }
                label = names.joined(separator: ", ")
            } else if user.email == AppData.user.email {
                label = "Administrator (Current User)"
            } else {
                label = "Administrator"
            }
            return (user, label)
        })
        
        self.tableView.reloadData()
    }
    
    @IBAction func addAction(_ sender: Any) {
        let controller = BusinessUserEditController.instantiate()
        controller.business = business
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    static func instantiate() -> BusinessUserListController {
        return AppHelper.instantiate("BusinessUserList") as! BusinessUserListController
    }
}

extension BusinessUserListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data != nil ? data.count : 0
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "BusinessUserCell", for: indexPath) as! BusinessUserCell
        let (user, locations) = data[indexPath.row]
        
        cell.user = user
        cell.subTitle.text = locations
        cell.drawUnderline()
        
        return cell
    }
    
}

extension BusinessUserListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let (user, _) = data[indexPath.row]

        if user.email == AppData.user.email {
            PopupController.showGray("Cannot edit currently logged in user", ok: "Ok")
            return
        }
        
        let controller = BusinessUserEditController.instantiate()
        controller.business = business
        controller.businessUser = user
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
}

