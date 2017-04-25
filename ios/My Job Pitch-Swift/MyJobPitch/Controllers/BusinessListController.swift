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
    @IBOutlet weak var firstCreateMessage: UIButton!
    
    var addJobMode = false
    
    var data: NSMutableArray! = NSMutableArray()
    
    var addButton: UIBarButtonItem!
    
    static var firstCreate = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if addJobMode {
            title = "Add job"
            headerImgView.image = UIImage(named: "menu-business-plus")?.withRenderingMode(.alwaysTemplate)
        } else {
            headerView.removeFromSuperview()
            addButton = navigationItem.rightBarButtonItem
        }
        
        navigationItem.rightBarButtonItem = nil
        
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        AppHelper.showLoading("Loading...")
        self.loadBusinesses()
    }
    
    func loadBusinesses() {
        API.shared().loadBusinesses(success: { (data) in
            AppHelper.hideLoading()
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
        if BusinessListController.firstCreate {
            emptyView.isHidden = true
            firstCreateMessage.isHidden = false
            navigationItem.rightBarButtonItem = nil
            self.tableView.reloadData()
            return
        }
        
        firstCreateMessage.isHidden = true
        
        navigationItem.rightBarButtonItem = addButton
        headerAddButtonDisable?.isHidden = true
        if data.count == 0 {
            tableView.isScrollEnabled = false
            emptyView.isHidden = false
            emptyMessage.text = "You have not added any\n businesses yet."
            emptyButton.setTitle("Create business", for: .normal)
        } else if !AppData.user.canCreateBusinesses {
            navigationItem.rightBarButtonItem = nil
            headerAddButtonDisable?.isHidden = false
            if addJobMode {
                emptyView.isHidden = true 
            } else {
                emptyView.isHidden = false
                emptyMessage.text = "Have more than one company?\n Get in touch!"
                emptyButton.setTitle("sales@myjobpitch.com", for: .normal)
            }
            tableView.isScrollEnabled = false
        } else {
            emptyView.isHidden = true
        }
        self.tableView.reloadData()
    }
    
    @IBAction func addAction(_ sender: Any) {
        
        if AppData.user.canCreateBusinesses || data.count == 0 {
            BusinessEditController.pushController(business: nil)
        } else {
            let url = URL(string: "mailto:sales@myjobpitch.com")!
            UIApplication.shared.openURL(url)
        }
    }
    
    @IBAction func clickFirstCreateMessage(_ sender: Any) {
        LocationEditController.pushController(business: data[0] as! Business, location: nil)
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
        
        if !addJobMode {
            
            var buttons = [
                MGSwipeButton(title: "",
                              icon: UIImage(named: "edit-big-icon"),
                              backgroundColor: AppData.greenColor,
                              padding: 20,
                              callback: { (cell) -> Bool in
                                BusinessEditController.pushController(business: business)
                                return true
                })
            ]
            
            if AppData.user.canCreateBusinesses && AppData.user.businesses.count > 1 {
                
                buttons.insert(
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
                                        }, failure: self.handleErrors)
                                        
                                        cell.hideSwipe(animated: true)
                                        
                                    }, cancel: "Cancel", cancelCallback: {
                                        cell.hideSwipe(animated: true)
                                    })
                                    
                                    return false
                    }), at: 0
                )
                
            }
            
            cell.rightButtons = buttons
            
        }
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        return cell
        
    }
    
}

extension BusinessListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        if BusinessListController.firstCreate {
            LocationEditController.pushController(business: data[0] as! Business, location: nil)
            return
        }
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "LocationList") as! BusinessDetailController
        controller.addJobMode = addJobMode
        controller.businessId = (data[indexPath.row] as! Business).id
        navigationController?.pushViewController(controller, animated: true)
        
    }
    
}
