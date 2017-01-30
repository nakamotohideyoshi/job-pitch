//
//  LocationListController.swift
//  MyJobPitch
//
//  Created by dev on 12/26/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class LocationListController: MJPController {
    
    static var reloadRequest = false
    
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: UIView!
    @IBOutlet weak var creditsLabel: UILabel!
    
    var business: Business!
    
    var data: NSMutableArray!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        data = NSMutableArray()
        
        if business == nil {
            AppHelper.showLoading("Loading...")
            let businessID = AppData.user.businesses.firstObject as! NSNumber
            API.shared().loadBusiness(id: businessID, success: { (data) in
                self.business = data as! Business
                self.creditsLabel.text = String(format: "%@ Credit", self.business.tokens)
                self.refresh()
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
        } else {
            creditsLabel.text = String(format: "%@ Credit", business.tokens)
            refresh()
        }
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if LocationListController.reloadRequest {
            LocationListController.reloadRequest = false
            tableView.reloadData()
        }
    }
    
    func refresh() {
        
        AppHelper.showLoading("Loading...")
        
        API.shared().loadLocationsForBusiness(businessId: business.id, success: { (data) in
            AppHelper.hideLoading()
            self.data = data.mutableCopy() as! NSMutableArray
            self.tableView.reloadData()
            self.emptyView.isHidden = self.data.count > 0
            self.business.locations = self.data
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
        
    }
    
    @IBAction func addAction(_ sender: Any) {
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "LocationEdit") as! LocationEditController
        controller.business = business
        controller.savedLocation = {
            self.refresh()
            BusinessListController.reloadRequest = true
        }
        navigationController?.pushViewController(controller, animated: true)
        
    }
    
}

extension LocationListController: UITableViewDataSource {
    
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
                            
                            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "LocationEdit") as! LocationEditController
                            controller.location = location
                            controller.savedLocation = self.refresh
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
                            
                            let message = String(format: "Are you sure you want to delete %@", location.name)
                            PopupController.showYellow(message, ok: "Delete", okCallback: {
                                
                                AppHelper.showLoading("Deleting...")
                                
                                API.shared().deleteLocation(id: location.id, success: {
                                    AppHelper.hideLoading()
                                    BusinessListController.reloadRequest = true
                                    self.data.remove(location)
                                    self.tableView.reloadData()
                                    self.emptyView.isHidden = self.data.count > 0
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

extension LocationListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let location = data[indexPath.row] as! Location
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobList") as! JobListController
        controller.location = location
        navigationController?.pushViewController(controller, animated: true)
        
        
    }
    
}
