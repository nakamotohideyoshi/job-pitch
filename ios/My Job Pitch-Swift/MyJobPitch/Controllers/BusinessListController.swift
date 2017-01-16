//
//  BusinessListController.swift
//  MyJobPitch
//
//  Created by dev on 12/26/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class BusinessListController: MJPController {
    
    @IBOutlet weak var tableView: UITableView!
    
    var data: NSMutableArray!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        data = NSMutableArray()
        refresh()
        
    }
    
    func refresh() {
        
        AppHelper.showLoading("Loading...")
        
        API.shared().loadBusinesses(success: { (data) in
            AppHelper.hideLoading()
            self.data = data.mutableCopy() as! NSMutableArray
            
            if !AppData.user.canCreateBusinesses && self.data.count > 0 {
                SideMenuController.pushController(id: "locations")
            } else {
                self.tableView.reloadData()
            }
            
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
        
    }
    
    @IBAction func addAction(_ sender: Any) {
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "BusinessEdit") as! BusinessEditController
        controller.savedBusiness = refresh
        navigationController?.pushViewController(controller, animated: true)
        
    }
    
}

extension BusinessListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let business = data[indexPath.row] as! Business
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "BusinessCell", for: indexPath) as! BusinessCell
        
        cell.setData(business)
        
        cell.leftButtons = [
            MGSwipeButton(title: "",
                          icon: UIImage(named: "edit-big-icon"),
                          backgroundColor: AppData.greenColor,
                          padding: 20,
                          callback: { (cell) -> Bool in
                            
                            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "BusinessEdit") as! BusinessEditController
                            controller.business = business
                            controller.savedBusiness = self.refresh
                            self.navigationController?.pushViewController(controller, animated: true)
                            
                            return true
            })
        ]
        
        cell.rightButtons = [
            MGSwipeButton(title: "",
                          icon: UIImage(named: "delete-big-icon"),
                          backgroundColor: AppData.yellowColor,
                          padding: 20,
                          callback: { (cell) -> Bool in
                            
                            let message = String(format: "Are you sure you want to delete %@", business.name)
                            PopupController.showYellow(message, ok: "Delete", okCallback: {
                                
                                AppHelper.showLoading("Deleting...")
                                
                                API.shared().deleteBusiness(id: business.id, success: {
                                    AppHelper.hideLoading()
                                    self.data.remove(business)
                                    self.tableView.reloadData()
                                }) { (message, errors) in
                                    self.handleErrors(message: message, errors: errors)
                                }
                                
                                cell.hideSwipe(animated: true)
                                
                            }, cancel: "Cancel", cancelCallback: {
                                cell.hideSwipe(animated: true)
                            })
                            
                            return false
            })
        ]

        return cell
        
    }
    
}

extension BusinessListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let business = data[indexPath.row] as! Business
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "LocationList") as! LocationListController
        controller.business = business
        navigationController?.pushViewController(controller, animated: true)
        
    }
    
}
