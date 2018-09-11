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
    
    @IBOutlet weak var headerView: UIView!
    @IBOutlet weak var headerImgView: UIImageView!
    @IBOutlet weak var headerAddButtonDisable: UIView!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: UIView!
    @IBOutlet weak var emptyMessage: UILabel!
    @IBOutlet weak var emptyButton: UIButton!
    
    var addButton: UIBarButtonItem!
    var data: NSMutableArray! = NSMutableArray()
    var canCreateBusinesses = false
    var isAddMode = false
    var isUserMode = false
    
    var refresh = true
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        isUserMode = SideMenuController.currentID == "users"
        canCreateBusinesses = (AppData.user.canCreateBusinesses && !isUserMode)
        isAddMode = (SideMenuController.currentID != "businesses" && !isUserMode)
        
        addButton = navigationItem.rightBarButtonItem
        navigationItem.rightBarButtonItem = nil
        
        if isUserMode {
            title = "Choose Business"
            headerView.removeFromSuperview()
            emptyView.isHidden = true
        } else if isAddMode {
            title = "Add job"
            headerImgView.image = UIImage(named: "menu-business")?.withRenderingMode(.alwaysTemplate)
            emptyView.isHidden = true
        } else {
            title = "Businesses"
            headerView.removeFromSuperview()
        }
    
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        if refresh {
            refresh = false
            showLoading()
            self.loadBusinesses()
        }
    }
    
    func loadBusinesses() {
        API.shared().loadBusinesses(success: { (data) in
            self.hideLoading()
            self.data = data.mutableCopy() as! NSMutableArray
            self.updateBusinessList()
            let businesses = NSMutableArray()
            for business in self.data {
                businesses.add((business as! Business).id)
            }
            AppData.user.businesses = businesses
        }, failure: self.handleErrors)
    }
    
    func updateBusinessList() {
        
        self.tableView.reloadData()
        
        if isUserMode {
            navigationItem.rightBarButtonItem = nil
            emptyView.isHidden = data.count != 0
            tableView.isScrollEnabled = !emptyView.isHidden
            
            if data.count == 0 {
                emptyMessage.text = "You are not an administrator of any businesses"
                emptyButton.isHidden = true
            }
        } else {
            if isAddMode {
                headerAddButtonDisable?.isHidden = !canCreateBusinesses
                return
            }
            
            navigationItem.rightBarButtonItem = (data.count == 0 || canCreateBusinesses) ? addButton : nil
            emptyView.isHidden = !(data.count == 0 || !canCreateBusinesses)
            tableView.isScrollEnabled = !emptyView.isHidden
            if data.count == 0 {
                emptyMessage.text = "Hi, Welcome to MyJobPitch\nLets start with easy adding your Business"
                emptyButton.setTitle("Create business", for: .normal)
            } else if !AppData.user.canCreateBusinesses {
                emptyMessage.text = "Got more that one business?\nGet in touch to talk about how we can help you.\nRemember, you can always create additional workplaces under your existing business."
                emptyButton.setTitle("Contact Us", for: .normal)
            }
        }
    }
    
    @IBAction func addAction(_ sender: Any) {
        
        if AppData.user.canCreateBusinesses || data.count == 0 {
            refresh = true
            BusinessEditController.pushController(business: nil)
        } else {
            let url = URL(string: "mailto:support@myjobpitch.com")!
            if #available(iOS 10.0, *) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            } else {
                UIApplication.shared.openURL(url)
            }
        }
    }
    
    func deleteBusiness(_ business: Business) {
        self.showLoading()
        
        API.shared().deleteBusiness(id: business.id, success: {
            self.data.remove(business)
            API.shared().getUser(success: { (data) in
                self.hideLoading()
                AppData.user = data as! User
                self.updateBusinessList()
            }, failure: self.handleErrors)
        }, failure: self.handleErrors)
    }
    
}

extension BusinessListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let business = data[indexPath.row] as! Business
        let cell = tableView.dequeueReusableCell(withIdentifier: "BusinessCell", for: indexPath) as! BusinessCell
                
        if isUserMode {
            cell.setUsersData(business)
        } else {
            cell.setData(business)
        
            if !isAddMode {
                
                var buttons = [MGSwipeButton]()
                
                if !business.restricted {
                    buttons.insert(MGSwipeButton(title: "",
                                                 icon: UIImage(named: "edit-big-icon"),
                                                 backgroundColor: AppData.greenColor,
                                                 padding: 20,
                                                 callback: { (cell) -> Bool in
                                                    self.refresh = true
                                                    BusinessEditController.pushController(business: business)
                                                    return true
                    }), at: 0)
                }
                
                if AppData.user.canCreateBusinesses && AppData.user.businesses.count > 1 {
                    
                    buttons.insert(
                        MGSwipeButton(title: "",
                                      icon: UIImage(named: "delete-big-icon"),
                                      backgroundColor: AppData.yellowColor,
                                      padding: 20,
                                      callback: { (cell) -> Bool in
                                        
                                        let message = String(format: "Are you sure you want to delete %@", business.name)
                                        PopupController.showYellow(message, ok: "Delete", okCallback: {
                                            
                                            let locationCount = business.locations.count
                                            if locationCount == 0 {
                                                self.deleteBusiness(business)
                                                cell.hideSwipe(animated: true)
                                                return
                                            }
                                            
                                            let message1 = String(format: "Deleting this business will also delete %d workplaces and all their jobs. If you want to hide the jobs instead you can deactive them.", locationCount)
                                            PopupController.showYellow(message1, ok: "Delete", okCallback: {
                                                self.deleteBusiness(business)
                                                cell.hideSwipe(animated: true)
                                            }, cancel: "Cancel", cancelCallback: nil)
                                            
                                        }, cancel: "Cancel", cancelCallback: {
                                            cell.hideSwipe(animated: true)
                                        })
                                        
                                        return false
                        }), at: 0
                    )
                    
                }
                
                cell.rightButtons = buttons
                
            }
        }
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        return cell
        
    }
    
}

extension BusinessListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        refresh = true
        
        let business = data[indexPath.row] as! Business
        if isUserMode {
            if business.restricted {
                PopupController.showGray("You must an administrator to view this information.", ok: "Ok")
            } else {
                let controller = BusinessUserListController.instantiate()
                controller.business = business
                navigationController?.pushViewController(controller, animated: true)
            }
        } else {
            let controller = AppHelper.instantiate("LocationList") as! BusinessDetailController
            controller.businessId = business.id
            navigationController?.pushViewController(controller, animated: true)
        }
    }
    
}
