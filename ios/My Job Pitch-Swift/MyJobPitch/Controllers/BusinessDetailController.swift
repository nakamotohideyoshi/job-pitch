//
//  BusinessDetailController.swift
//  MyJobPitch
//
//  Created by dev on 12/26/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class BusinessDetailController: MJPController {
    
    @IBOutlet weak var headerImgView: UIImageView!
    @IBOutlet weak var headerComment: UILabel!
    @IBOutlet weak var headerName: UILabel!
    @IBOutlet weak var headerSubTitle: UILabel!
    @IBOutlet weak var headerCreditCount: UIButton!
    @IBOutlet weak var headerNavTitle: UILabel!
    @IBOutlet weak var editButtonDisable: UIView!
    @IBOutlet weak var removeButtonDisable: UIView!
    @IBOutlet weak var controlHeightConstraint: NSLayoutConstraint!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: UIView!
    @IBOutlet weak var firstCreateMessage: UIButton!
    @IBOutlet weak var toolbar: UIToolbar!
    
    var business: Business!
    var data: NSMutableArray! = NSMutableArray()
    var isAddMode = false
    
    var isFirstCreate = false
    var businessId: NSNumber!
    
    var refresh = true
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        headerName.text = ""
        headerSubTitle.text = ""
        headerCreditCount.setTitle("", for: .normal)
        
        isAddMode = SideMenuController.currentID != "businesses"
        
        if isAddMode {
            title = "Add job"
            headerImgView.image = UIImage(named: "menu-business")?.withRenderingMode(.alwaysTemplate)
            headerCreditCount.isHidden = true
            headerSubTitle.isHidden = true
            controlHeightConstraint.constant = 0
            headerNavTitle.text = "Select workplace"
        } else {
            headerComment.isHidden = true
            headerNavTitle.text = "Workplaces"
            removeButtonDisable.isHidden = AppData.user.canCreateBusinesses && AppData.user.businesses.count > 1
        }
        
        tableView.addPullToRefresh {
            self.loadLocations()
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        if refresh {
            refresh = false
            showLoading()
            API.shared().loadBusiness(id: businessId, success: { (data) in
                self.business = data as! Business
                
                if self.business.restricted {
                    self.editButtonDisable.isHidden = false
                    self.toolbar.items?.remove(at: 1)
                }

                if !self.isAddMode {
                    self.updateBusinessInfo()
                }
                self.loadLocations()
            }, failure: self.handleErrors)
        }
    }
    
    func updateBusinessInfo() {
        AppHelper.loadLogo(image: business.getImage(), imageView: headerImgView, completion: nil)
        headerName.text = business.name
        headerCreditCount.setTitle(String(format: "%@ %@", business.tokens, business.tokens.intValue > 1 ? "Credits" : "Credit"), for: .normal);
    }
    
    func loadLocations() {
        API.shared().loadLocationsForBusiness(businessId: businessId, success: { (data) in
            self.hideLoading()
            self.data = data.mutableCopy() as! NSMutableArray
            self.updateLocationList()
            self.tableView.pullToRefreshView.stopAnimating()
        }, failure: self.handleErrors)
    }
    
    func updateLocationList() {
        if !isAddMode {
            headerSubTitle.text = String(format: "Includes %lu %@", data.count, data.count > 1 ? "workplaces" : "workplace")
        }
        
        firstCreateMessage.isHidden = !isFirstCreate
        emptyView.isHidden = isFirstCreate || self.data.count > 0
        tableView.reloadData()
    }
    
    @IBAction func editBusinessAction(_ sender: Any) {
        refresh = true
        BusinessEditController.pushController(business: business)
    }
    
    @IBAction func deleteBusinessAction(_ sender: Any) {
        let message = String(format: "Are you sure you want to delete %@", headerName.text!)
        PopupController.showYellow(message, ok: "Delete", okCallback: {
            let locationCount = self.business.locations.count
            if locationCount == 0 {
                self.deleteBusiness()
                return
            }
            
            let message1 = String(format: "Deleting this business will also delete %d workplaces and all their jobs. If you want to hide the jobs instead you can deactive them.", locationCount)
            PopupController.showYellow(message1, ok: "Delete", okCallback: {
                self.deleteBusiness()
            }, cancel: "Cancel", cancelCallback: nil)
            
        }, cancel: "Cancel", cancelCallback: nil)
        
    }
    
    @IBAction func addLocationAction(_ sender: Any) {
        refresh = true
        isFirstCreate = false
        LocationEditController.pushController(business: business, location: nil)
    }
    
    func deleteBusiness() {
        self.showLoading()
        API.shared().deleteBusiness(id: businessId, success: {
            self.hideLoading()
            _ = self.navigationController?.popViewController(animated: true)
        }, failure: self.handleErrors)
    }
    
    func deleteWorkplace(_ location: Location) {
        self.showLoading()
        API.shared().deleteLocation(id: location.id, success: {
            self.hideLoading()
            self.data.remove(location)
            self.updateLocationList()
        }, failure: self.handleErrors)
    }
    
}

extension BusinessDetailController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let location = data[indexPath.row] as! Location
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "LocationCell", for: indexPath) as! LocationCell
        
        cell.setData(location)
        
        if !isAddMode {
            
            cell.rightButtons = [
                MGSwipeButton(title: "",
                              icon: UIImage(named: "delete-big-icon"),
                              backgroundColor: AppData.yellowColor,
                              padding: 20,
                              callback: { (cell) -> Bool in
                                let message = String(format: "Are you sure you want to delete %@", location.name)
                                PopupController.showYellow(message, ok: "Delete", okCallback: {
                                    let jobCount = location.jobs.count
                                    if jobCount == 0 {
                                        self.deleteWorkplace(location)
                                        cell.hideSwipe(animated: true)
                                        return
                                    }
                                    
                                    let message1 = String(format: "Deleting this workplace will also delete %d jobs. If you want to hide the jobs instead you can deactive them.", jobCount)
                                    PopupController.showYellow(message1, ok: "Delete", okCallback: {
                                        self.deleteWorkplace(location)
                                        cell.hideSwipe(animated: true)
                                    }, cancel: "Cancel", cancelCallback: {
                                        cell.hideSwipe(animated: true)
                                    })
                                    
                                }, cancel: "Cancel", cancelCallback: {
                                    cell.hideSwipe(animated: true)
                                })
                                
                                return false
                }),
                MGSwipeButton(title: "",
                              icon: UIImage(named: "edit-big-icon"),
                              backgroundColor: AppData.greenColor,
                              padding: 20,
                              callback: { (cell) -> Bool in
                                self.refresh = true
                                LocationEditController.pushController(business: nil, location: location)
                                return true
                })
            ]
            
        }
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        return cell
        
    }
    
}

extension BusinessDetailController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        refresh = true
        
        let location = data[indexPath.row] as! Location
        
        if isAddMode {
            let controller = AppHelper.instantiate("JobEdit") as! JobEditController
            controller.location = location
            navigationController?.pushViewController(controller, animated: true)
        } else {
            let controller = AppHelper.instantiate("JobList") as! LocationDetailController
            controller.location = location
            navigationController?.pushViewController(controller, animated: true)
        }
    }
    
}
