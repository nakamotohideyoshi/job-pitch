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
    
    @IBOutlet weak var infoView: AppInfoSmallView!
    @IBOutlet weak var toolbar: SmallToolbar!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: EmptyView!
    
    var businesses: [Business]!
    var businessMode = false
    var userMode = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        businessMode = SideMenuController.currentID == "businesses"
        userMode = SideMenuController.currentID == "users"
        
        if businessMode {
            
            title = NSLocalizedString("Businesses", comment: "")
            infoView.superview?.isHidden = true
            toolbar.isHidden = true
            emptyView.action = addBusiness
            
        } else {
            
            if userMode {
                title = NSLocalizedString("Users", comment: "")
                infoView.setDescription(icon: "menu-users", text: NSLocalizedString("Select a business below to view users", comment: ""))
            } else {
                title = NSLocalizedString("Add job", comment: "")
                infoView.setDescription(icon: "menu-business", text: NSLocalizedString("Select which business to add job to", comment: ""))
            }
            
            toolbar.titleLabel.text = NSLocalizedString("SELECT A BUSINESS", comment: "")
            toolbar.rightAction = AppData.user.canCreateBusinesses ? addBusiness : nil
            emptyView.isHidden = true
        }
        
        tableView.addPullToRefresh {
            self.loadBusinesses()
        }
        
        showLoading()
        loadBusinesses()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if businesses != nil {
            updateList()
        }        
    }
    
    func loadBusinesses() {
        AppData.getBusinesses() { error in
            if error == nil {
                self.hideLoading()
                self.tableView.pullToRefreshView.stopAnimating()
                self.updateList()
            } else {
                self.handleError(error)
            }
        }
    }
    
    func updateList() {
        businesses = AppData.businesses
        
        if businessMode {
            
            if AppData.user.canCreateBusinesses || businesses.count == 0 {
                navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(addBusiness))
            } else {
                navigationItem.rightBarButtonItem = nil
            }
            
            emptyView.isHidden = false
            if businesses.count == 0 {
                emptyView.message.text = NSLocalizedString("Hi, Welcome to MyJobPitch\nLets start with easy adding your Business", comment: "")
                emptyView.button.setTitle(NSLocalizedString("Create business", comment: ""), for: .normal)
            } else if !AppData.user.canCreateBusinesses {
                emptyView.message.text = NSLocalizedString("Got more that one business?\nGet in touch to talk about how we can help you.\nRemember, you can always create additional workplaces under your existing business.", comment: "")
                emptyView.button.setTitle(NSLocalizedString("Contact Us", comment: ""), for: .normal)
            } else {
                emptyView.isHidden = true
            }
        }
        
        tableView.reloadData()
    }
    
    func addBusiness() {
        if businesses.count == 0 || AppData.user.canCreateBusinesses {
            
            let controller = BusinessEditController.instantiate()
            controller.saveComplete = { (business: Business) in
                let controller = BusinessDetailsController.instantiate()
                controller.business = business
                self.navigationController?.pushViewController(controller, animated: false)
            }
            present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
            
        } else {
            
            let url = URL(string: "mailto:support@myjobpitch.com")!
            if #available(iOS 10.0, *) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            } else {
                UIApplication.shared.openURL(url)
            }
        }
    }
    
    static func instantiate() -> BusinessListController {
        return AppHelper.instantiate("BusinessList") as! BusinessListController
    }
}

extension BusinessListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return businesses == nil ? 0 : businesses.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "BusinessCell", for: indexPath) as! BusinessCell
        let business = businesses[indexPath.row]
        
        AppHelper.loadLogo(business, imageView: cell.infoView.imgView, completion: nil)
        cell.infoView.titleLabel.text = business.name
        
        if userMode {
            
            let userCount = business.users.count
            cell.infoView.subTitleLabel.text = String(format: "%lu %@", userCount, userCount > 1 ? NSLocalizedString("users", comment: "") : NSLocalizedString("user", comment: ""))
            cell.creditCount.isHidden = true
            
        } else {
            
            let workplaceCount = business.locations.count
            if workplaceCount > 1 {
                cell.infoView.subTitleLabel.text = String(format: "Includes %lu workplaces", workplaceCount)
            } else {
                cell.infoView.subTitleLabel.text = String(format: "Includes %lu workplace", workplaceCount)
            }
            
            cell.creditCount.text = String(format: "%@ %@", business.tokens, business.tokens.intValue > 1 ? NSLocalizedString("Credits", comment: "") : NSLocalizedString("Credit", comment: ""))
        
            if businessMode && !business.restricted {
                
                var buttons = [
                    MGSwipeButton(title: "",
                                  icon: UIImage(named: "edit-big-icon"),
                                  backgroundColor: AppData.greenColor,
                                  padding: 20,
                                  callback: { (cell) -> Bool in
                                    let controller = BusinessEditController.instantiate()
                                    controller.business = business
                                    self.present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
                                    return true
                    })
                ]
                
                if AppData.user.canCreateBusinesses && AppData.businesses.count > 1 {
                    
                    buttons.insert(
                        MGSwipeButton(title: "",
                                      icon: UIImage(named: "delete-big-icon"),
                                      backgroundColor: AppData.yellowColor,
                                      padding: 20,
                                      callback: { (cell) -> Bool in
                                        
                                        let message = workplaceCount == 0 ?
                                                String(format: NSLocalizedString("Are you sure you want to delete %@", comment: ""), business.name) :
                                                String(format: NSLocalizedString("Deleting this business will also delete %d workplaces and all their jobs. If you want to hide the jobs instead you can deactive them.", comment: ""), workplaceCount)
                                        PopupController.showYellow(message, ok: NSLocalizedString("Delete", comment: ""), okCallback: {
                                            
                                            cell.hideSwipe(animated: true)
                                            self.showLoading()
                                            AppData.removeBusiness(business) { error in
                                                if error == nil {
                                                    self.hideLoading()
                                                    self.updateList()
                                                } else {
                                                    self.handleError(error)
                                                }                                                
                                            }
                                            
                                        }, cancel: NSLocalizedString("Cancel", comment: ""), cancelCallback: {
                                            cell.hideSwipe(animated: true)
                                        })
                                        
                                        return false
                        }), at: 0
                    )
                }
                
                cell.rightButtons = buttons
            }
        }
        
        cell.drawUnderline()
        
        return cell
    }
    
}

extension BusinessListController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let business = businesses[indexPath.row]
        
        if userMode {
            
            if business.restricted {
                PopupController.showGray(NSLocalizedString("You must an administrator to view this information.", comment: ""),
                                         ok: NSLocalizedString("Ok", comment: ""))
            } else {
                let controller = BusinessUserListController.instantiate()
                controller.business = business
                navigationController?.pushViewController(controller, animated: true)
            }

        } else {
            
            let controller = BusinessDetailsController.instantiate()
            controller.business = business
            navigationController?.pushViewController(controller, animated: true)
        }
    }
}
