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
    
    static var reloadRequest = false
    
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: UIView!
    @IBOutlet weak var emptyMessage: UILabel!
    @IBOutlet weak var emptyButton: UIButton!
    
    var data: NSMutableArray!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        data = NSMutableArray()
        refresh()
        
        if !AppData.user.canCreateBusinesses {
            tableView.isScrollEnabled = false
        }
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if BusinessListController.reloadRequest {
            BusinessListController.reloadRequest = false
            tableView.reloadData()
        }
    }
    
    func refresh() {
        
        AppHelper.showLoading("Loading...")
        
        API.shared().loadBusinesses(success: { (data) in
            AppHelper.hideLoading()
            self.data = data.mutableCopy() as! NSMutableArray
            self.tableView.reloadData()
            self.updateUI()
            AppData.user.businesses = self.data
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
        
    }
    
    func updateUI() {
        
        self.emptyView.isHidden = AppData.user.canCreateBusinesses && self.data.count > 0
        if self.data.count == 0 {
            self.emptyMessage.text = "You have not added any\n businesses yet."
            self.emptyButton.setTitle("Create business", for: .normal)
        } else if !AppData.user.canCreateBusinesses {
            self.emptyMessage.text = "Have more than one company?\n Get in touch!"
            self.emptyButton.setTitle("sales@myjobpitch.com", for: .normal)
        }
        
    }
    
    @IBAction func addAction(_ sender: Any) {
        
        if AppData.user.canCreateBusinesses || data.count == 0 {
            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "BusinessEdit") as! BusinessEditController
            controller.savedBusiness = refresh
            navigationController?.pushViewController(controller, animated: true)
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
                            
                            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "BusinessEdit") as! BusinessEditController
                            controller.business = business
                            controller.savedBusiness = self.refresh
                            self.navigationController?.pushViewController(controller, animated: true)
                            
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
                                        self.tableView.reloadData()
                                        self.updateUI()
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
        
        return cell
        
    }
    
}

extension BusinessListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        if indexPath.row < data.count {
            
            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "LocationList") as! LocationListController
            controller.business = data[indexPath.row] as! Business
            navigationController?.pushViewController(controller, animated: true)
            
        }
        
    }
    
}
