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
    
    var addJobMode = false
    
    var data: NSMutableArray! = NSMutableArray()
    
    var addButton: UIBarButtonItem!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        addButton = navigationItem.rightBarButtonItem
        navigationItem.rightBarButtonItem = nil
        
        if addJobMode {
            title = "Add job"
            headerImgView.image = UIImage(named: "menu-business-plus")?.withRenderingMode(.alwaysTemplate)
        } else {
            headerView.removeFromSuperview()
        }
        
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
        if data.count == 0 {
            navigationItem.rightBarButtonItem = addButton
            headerAddButtonDisable?.isHidden = true
            tableView.isScrollEnabled = false
            emptyView.isHidden = false
            emptyMessage.text = "You have not added any\n businesses yet."
            emptyButton.setTitle("Create business", for: .normal)
        } else if !AppData.user.canCreateBusinesses {
            if !addJobMode {
                emptyView.isHidden = false
                emptyMessage.text = "Have more than one company?\n Get in touch!"
                emptyButton.setTitle("sales@myjobpitch.com", for: .normal)
            } else {
                emptyView.isHidden = true
            }
            tableView.isScrollEnabled = false
        } else {
            navigationItem.rightBarButtonItem = addButton
            headerAddButtonDisable?.isHidden = true
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
            
            cell.leftButtons = [
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
                                        }, failure: self.handleErrors)
                                        
                                        cell.hideSwipe(animated: true)
                                        
                                    }, cancel: "Cancel", cancelCallback: {
                                        cell.hideSwipe(animated: true)
                                    })
                                    
                                    return false
                    })
                ]
                
            }
            
        }
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        return cell
        
    }
    
}

extension BusinessListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "LocationList") as! BusinessDetailController
        controller.addJobMode = addJobMode
        controller.businessId = (data[indexPath.row] as! Business).id
        navigationController?.pushViewController(controller, animated: true)
        
    }
    
}
