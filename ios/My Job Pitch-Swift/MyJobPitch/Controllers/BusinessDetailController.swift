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
    
    static var refreshRequest = false
    
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: UIView!
    
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var subTitle: UILabel!
    @IBOutlet weak var creditCount: UIButton!
    
    var business: Business!
    
    var data: NSMutableArray!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        updateBusinessInfo()
        BusinessDetailController.refreshRequest = true
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if BusinessDetailController.refreshRequest {
            BusinessDetailController.refreshRequest = false
            
            AppHelper.showLoading("Loading...")
            
            data = NSMutableArray()
            
            API.shared().loadLocationsForBusiness(businessId: business.id, success: { (data) in
                AppHelper.hideLoading()
                self.data = data.mutableCopy() as! NSMutableArray
                self.updateLocationList(superRefresh: false)
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
        }
    }
    
    func updateBusinessInfo() {
        if let image = business.getImage() {
            AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        
        nameLabel.text = business.name
        creditCount.setTitle(String(format: "%@ %@", business.tokens, business.tokens.intValue > 1 ? "Credits" : "Credit"), for: .normal);
    }
    
    func updateLocationList(superRefresh: Bool) {
        if superRefresh {
            BusinessListController.refreshRequest = true
        }
        subTitle.text = String(format: "Includes %lu %@", data.count, data.count > 1 ? "locations" : "location")
        emptyView.isHidden = self.data.count > 0
        tableView.reloadData()
    }
    
    @IBAction func editBusinessAction(_ sender: Any) {
        BusinessEditController.pushController(business: business) { (business) in
            BusinessListController.refreshRequest = true
            self.business = business
            self.updateBusinessInfo()
        }
    }
    
    @IBAction func deleteBusinessAction(_ sender: Any) {
        
        let message = String(format: "Are you sure you want to delete %@", business.name)
        PopupController.showYellow(message, ok: "Delete", okCallback: {
            
            AppHelper.showLoading("Deleting...")
            
            API.shared().deleteBusiness(id: self.business.id, success: {
                AppHelper.hideLoading()
                BusinessListController.refreshRequest = true
                _ = self.navigationController?.popViewController(animated: true)
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
            
        }, cancel: "Cancel", cancelCallback: nil)
        
    }
    
    @IBAction func addLocationAction(_ sender: Any) {
        LocationEditController.pushController(business: business, location: nil) { (location) in
            self.data.add(location)
            self.updateLocationList(superRefresh: true)
        }
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
        
        cell.leftButtons = [
            MGSwipeButton(title: "",
                          icon: UIImage(named: "edit-big-icon"),
                          backgroundColor: AppData.greenColor,
                          padding: 20,
                          callback: { (cell) -> Bool in                            
                            LocationEditController.pushController(business: nil, location: location) { (location) in
                                self.data[indexPath.row] = location
                                self.updateLocationList(superRefresh: false)
                            }
                            return true
            })
        ]
        
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
                                    self.updateLocationList(superRefresh: true)
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
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        return cell
        
    }
    
}

extension BusinessDetailController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobList") as! LocationDetailController
        controller.location = data[indexPath.row] as! Location
        navigationController?.pushViewController(controller, animated: true)
        
        
    }
    
}
