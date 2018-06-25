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
    @IBOutlet weak var businessName: UILabel!
    
    var addButton: UIBarButtonItem!
    var data: NSMutableArray! = NSMutableArray()
    
    var business: Business!
    var businessId: NSNumber!
    var locations: [Location]!
    
    var refresh = true
    
    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Users"
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        if refresh {
            refresh = false
            showLoading()
            self.loadData()
        }
    }
    
    func loadData() {
        if locations == nil {
            loadLocations()
        } else  {
            loadUsers()
        }
    }
    
    func loadLocations() {
        API.shared().loadLocationsForBusiness(businessId: businessId, success: { (data) in
            self.locations = data as! [Location]
            self.loadUsers()
        }, failure: self.handleErrors)
    }
    
    func loadUsers() {
        API.shared().loadBusinessUsers(businessId: businessId, success: { (data) in
            self.hideLoading()
            self.data = data.mutableCopy() as! NSMutableArray
            self.updateUserList()
        }, failure: self.handleErrors)
    }
    
    func updateUserList() {
        self.tableView.reloadData()
    }
    
    @IBAction func addAction(_ sender: Any) {
        refresh = true
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "BusinessUserEdit") as! BusinessUserEditController
        controller.businessId = businessId
        controller.locations = locations
        controller.isEditMode = false
        navigationController?.pushViewController(controller, animated: true)
    }
}

extension BusinessUserListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let businessUser = data[indexPath.row] as! BusinessUser
        let cell = tableView.dequeueReusableCell(withIdentifier: "BusinessUserCell", for: indexPath) as! BusinessUserCell
        
        cell.setData(businessUser, locations)
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        return cell
        
    }
    
}

extension BusinessUserListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        refresh = true
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "BusinessUserEdit") as! BusinessUserEditController
        controller.locations = locations
        controller.isEditMode = true
        controller.businessUser = data[indexPath.row] as! BusinessUser
        controller.businessId = businessId
        navigationController?.pushViewController(controller, animated: true)
    }
    
}

