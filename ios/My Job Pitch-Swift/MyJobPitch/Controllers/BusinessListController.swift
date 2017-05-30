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
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        canCreateBusinesses = AppData.user.canCreateBusinesses
        isAddMode = SideMenuController.currentID != "businesses"
        
        addButton = navigationItem.rightBarButtonItem
        navigationItem.rightBarButtonItem = nil
        
        if isAddMode {
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
        
        self.tableView.reloadData()
        
        if isAddMode {
            headerAddButtonDisable?.isHidden = !canCreateBusinesses
            return
        }
        
        navigationItem.rightBarButtonItem = (data.count == 0 || canCreateBusinesses) ? addButton : nil
        emptyView.isHidden = !(data.count == 0 || !canCreateBusinesses)
        tableView.isScrollEnabled = !emptyView.isHidden
        if data.count == 0 {
            emptyMessage.text = "You have not added any\n businesses yet."
            emptyButton.setTitle("Create business", for: .normal)
        } else if !AppData.user.canCreateBusinesses {
            emptyMessage.text = "Have more than one company?\n Get in touch!"
            emptyButton.setTitle("sales@myjobpitch.com", for: .normal)
        }
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
        
        if !isAddMode {
            
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
                                            self.data.remove(business)
                                            API.shared().getUser(success: { (data) in
                                                AppHelper.hideLoading()
                                                AppData.user = data as! User
                                                self.updateBusinessList()
                                            }, failure: self.handleErrors)
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
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "LocationList") as! BusinessDetailController
        controller.businessId = (data[indexPath.row] as! Business).id
        navigationController?.pushViewController(controller, animated: true)
    }
    
}
