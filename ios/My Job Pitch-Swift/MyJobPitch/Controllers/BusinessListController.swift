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
    
    static var refreshRequest = false
    
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: UIView!
    @IBOutlet weak var emptyMessage: UILabel!
    @IBOutlet weak var emptyButton: UIButton!
    @IBOutlet weak var addButton: UIBarButtonItem!
    
    var data: NSMutableArray!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        navigationItem.rightBarButtonItem = nil
        
        BusinessListController.refreshRequest = true
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if BusinessListController.refreshRequest {
            BusinessListController.refreshRequest = false
            
            AppHelper.showLoading("Loading...")
            
            data = NSMutableArray()
            
            API.shared().loadBusinesses(success: { (data) in
                AppHelper.hideLoading()
                self.data = data.mutableCopy() as! NSMutableArray
                self.updateBusinessList()
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
        }
    }
    
    func updateBusinessList() {
        emptyView.isHidden = AppData.user.canCreateBusinesses && self.data.count > 0
        if data.count == 0 {
            emptyMessage.text = "You have not added any\n businesses yet."
            emptyButton.setTitle("Create business", for: .normal)
            tableView.isScrollEnabled = false
            navigationItem.rightBarButtonItem = addButton
        } else if !AppData.user.canCreateBusinesses {
            emptyMessage.text = "Have more than one company?\n Get in touch!"
            emptyButton.setTitle("sales@myjobpitch.com", for: .normal)
            tableView.isScrollEnabled = false
            navigationItem.rightBarButtonItem = nil
        } else {
            tableView.isScrollEnabled = true
            if navigationItem.rightBarButtonItem == nil {
                navigationItem.rightBarButtonItem = addButton
            }
        }
        self.tableView.reloadData()
    }
    
    @IBAction func addAction(_ sender: Any) {
        
        if AppData.user.canCreateBusinesses || data.count == 0 {
            BusinessEditController.pushController(business: nil) { (business) in
                self.data.add(business)
                self.updateBusinessList()
            }
        } else {
            let url = URL(string: "mailto:sales@myjobpitch.com")!
            UIApplication.shared.openURL(url)
        }
        
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
                            BusinessEditController.pushController(business: business) { (business) in
                                self.data[indexPath.row] = business
                                self.updateBusinessList()
                            }
                            return true
            })
        ]
        
        if AppData.user.canCreateBusinesses {
            
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
                                        self.updateBusinessList()
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
            
        }
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        return cell
        
    }
    
}

extension BusinessListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "LocationList") as! LocationListController
        controller.business = data[indexPath.row] as! Business
        navigationController?.pushViewController(controller, animated: true)
        
    }
    
}
