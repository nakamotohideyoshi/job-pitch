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
    @IBOutlet weak var removeButtonDisable: UIView!
    @IBOutlet weak var controlHeightConstraint: NSLayoutConstraint!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: UIView!
    
    var addJobMode = false
    var businessId: NSNumber!
    
    var business: Business!
    var data: NSMutableArray! = NSMutableArray()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        headerName.text = ""
        headerSubTitle.text = ""
        headerCreditCount.setTitle("", for: .normal)
        
        if addJobMode {
            title = "Add job"
            headerImgView.image = UIImage(named: "menu-business-plus")?.withRenderingMode(.alwaysTemplate)
            headerCreditCount.isHidden = true
            headerSubTitle.isHidden = true
            controlHeightConstraint.constant = 0
            headerNavTitle.text = "Select work place"
        } else {
            headerComment.isHidden = true
            removeButtonDisable.isHidden = AppData.user.canCreateBusinesses && AppData.user.businesses.count > 1
        }
        
        tableView.addPullToRefresh {
            self.loadLocations()
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        AppHelper.showLoading("Loading...")
        API.shared().loadBusiness(id: businessId, success: { (data) in
            self.business = data as! Business
            if !self.addJobMode {
                self.updateBusinessInfo()
            }
            self.loadLocations()
        }, failure: self.handleErrors)
    }
    
    func updateBusinessInfo() {
        if let image = business.getImage() {
            AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: headerImgView, completion: nil)
        } else {
            headerImgView.image = UIImage(named: "default-logo")
        }
        
        headerName.text = business.name
        headerCreditCount.setTitle(String(format: "%@ %@", business.tokens, business.tokens.intValue > 1 ? "Credits" : "Credit"), for: .normal);
    }
    
    func loadLocations() {
        API.shared().loadLocationsForBusiness(businessId: businessId, success: { (data) in
            AppHelper.hideLoading()
            self.data = data.mutableCopy() as! NSMutableArray
            self.updateLocationList()
            self.tableView.pullToRefreshView.stopAnimating()
        }, failure: self.handleErrors)
    }
    
    func updateLocationList() {
        headerSubTitle.text = String(format: "Includes %lu %@", data.count, data.count > 1 ? "work places" : "work place")
        emptyView.isHidden = self.data.count > 0
        tableView.reloadData()
    }
    
    @IBAction func editBusinessAction(_ sender: Any) {
        BusinessEditController.pushController(business: business)
    }
    
    @IBAction func deleteBusinessAction(_ sender: Any) {
        
        let message = String(format: "Are you sure you want to delete %@", headerName.text!)
        PopupController.showYellow(message, ok: "Delete", okCallback: {
            
            AppHelper.showLoading("Deleting...")
            API.shared().deleteBusiness(id: self.businessId, success: {
                AppHelper.hideLoading()
                _ = self.navigationController?.popViewController(animated: true)
            }, failure: self.handleErrors)
            
        }, cancel: "Cancel", cancelCallback: nil)
        
    }
    
    @IBAction func addLocationAction(_ sender: Any) {
        LocationEditController.pushController(business: business, location: nil)
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
        
        if !addJobMode {
            
            cell.rightButtons = [
                MGSwipeButton(title: "",
                              icon: UIImage(named: "delete-big-icon"),
                              backgroundColor: AppData.yellowColor,
                              padding: 20,
                              callback: { (cell) -> Bool in
                                
                                let message = String(format: "Are you sure you want to delete %@", location.name)
                                PopupController.showYellow(message, ok: "Delete", okCallback: {
                                    
                                    AppHelper.showLoading("Deleting...")
                                    
                                    API.shared().deleteLocation(id: location.id, success: {
                                        AppHelper.hideLoading()
                                        self.data.remove(location)
                                        self.updateLocationList()
                                    }, failure: self.handleErrors)
                                    
                                    cell.hideSwipe(animated: true)
                                    
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
        
        let location = data[indexPath.row] as! Location
        
        if !addJobMode {
            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobList") as! LocationDetailController
            controller.location = location
            navigationController?.pushViewController(controller, animated: true)
        } else {
            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobEdit") as! JobEditController
            controller.addJobMode = true
            controller.location = location
            navigationController?.pushViewController(controller, animated: true)
        }
    }
    
}
