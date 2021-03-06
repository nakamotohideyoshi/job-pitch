//
//  BusinessDetailsController.swift
//  MyJobPitch
//
//  Created by dev on 12/26/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class BusinessDetailsController: MJPController {
    
    @IBOutlet weak var infoView: AppInfoSmallView!
    @IBOutlet weak var creditCount: UILabel!
    @IBOutlet weak var editRemoveView: EditRemoveView!
    @IBOutlet weak var toolbar: SmallToolbar!
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var emptyView: EmptyView!
    
    public var business: Business!
    
    var workplaces: [Location]!
    var addMode = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        addMode = SideMenuController.currentID != "businesses"
        
        if addMode {
            
            title = NSLocalizedString("Add job", comment: "")
            infoView.setDescription(icon: "menu-business", text: NSLocalizedString("Select which workplace to add job to", comment: ""))

            creditCount.isHidden = true
            editRemoveView.isHidden = true

            toolbar.titleLabel.text = NSLocalizedString("SELECT A WORKOPLACE", comment: "")
            
        } else {
            
            title = NSLocalizedString("Businesses", comment: "")
            
            AppHelper.loadLogo(business, imageView: infoView.imgView, completion: nil)
            infoView.titleLabel.text = business.name
            creditCount.text = String(format: "%@ %@", business.tokens, business.tokens.intValue > 1 ? NSLocalizedString("Credits", comment: "") : NSLocalizedString("Credit", comment: ""))
            
            toolbar.titleLabel.text = NSLocalizedString("WORKPLACES", comment: "")
        }
        
        if !business.restricted {
            editRemoveView.editCallback = editBusiness
            
            if AppData.user.canCreateBusinesses && AppData.businesses.count > 1 {
                editRemoveView.removeCallback = removeBusiness
            }
            
            toolbar.rightAction = addWorkplace
            
            emptyView.button.setTitle(NSLocalizedString("Create workplace", comment: ""), for: .normal)
            emptyView.action = addWorkplace
        }
        
        tableView.addPullToRefresh {
            self.loadWorkplaces()
        }
        
        showLoading()
        loadWorkplaces()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if workplaces != nil {
            updateList()
        }        
    }
    
    func loadWorkplaces() {
        AppData.getWorkplaces(businessId: business.id) { error in
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
        business = AppData.businesses.filter {$0.id == business.id }[0]
        workplaces = AppData.workplaces
        
        if !addMode {
            let workplaceCount = workplaces.count
            if workplaceCount > 1 {
                infoView.subTitleLabel.text = String(format: NSLocalizedString("Includes %lu workplaces", comment: ""), workplaceCount)
            } else {
                infoView.subTitleLabel.text = String(format: NSLocalizedString("Includes %lu workplace", comment: ""), workplaceCount)
            }
        }
        
        emptyView.isHidden = workplaces.count > 0
        
        if UserDefaults.standard.integer(forKey: "tutorial") == 1 {
            emptyView.message.text = NSLocalizedString("Great, you've created your business!\nNow tap to create your workplaces.", comment: "")
        } else {
            emptyView.message.text = NSLocalizedString("You have not added any workplaces yet.", comment: "")
        }
        
        tableView.reloadData()
    }
    
    func editBusiness() {
        let controller = BusinessEditController.instantiate()
        controller.business = business
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    func removeBusiness() {
        
        let workplaceCount = workplaces.count
        let message = workplaceCount == 0 ?
            String(format: NSLocalizedString("Are you sure you want to delete %@", comment: ""), business.name) :
            String(format: NSLocalizedString("Deleting this business will also delete %d workplaces and all their jobs. If you want to hide the jobs instead you can deactive them.", comment: ""), workplaceCount)
        PopupController.showYellow(message, ok: NSLocalizedString("Delete", comment: ""), okCallback: {
            
            self.showLoading()
            AppData.removeBusiness(self.business) { error in
                if error == nil {
                    _ = self.navigationController?.popViewController(animated: true)
                } else {
                    self.handleError(error)
                }
            }
            
        }, cancel: NSLocalizedString("Cancel", comment: ""), cancelCallback: nil)
    }
    
    func addWorkplace() {
        let controller = LocationEditController.instantiate()
        controller.business = business
        controller.saveComplete = { (workplace: Location) in
            if !self.addMode {
                self.workplaceDetails(workplace, animated: false)
            }
        }
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    func workplaceDetails(_ workplace: Location, animated: Bool) {
        let controller = LocationDetailsController.instantiate()
        controller.workplace = workplace
        navigationController?.pushViewController(controller, animated: animated)
    }
    
    func addJob(_ workplace: Location) {
        let controller = JobEditController.instantiate()
        controller.workplace = workplace
        controller.saveComplete = { (job: Job) in
            var controllers = self.navigationController?.viewControllers
            while true {
                let count = (controllers?.count)!
                if count <= 2 || controllers?[count - 2] is SelectJobController {
                    _ = self.navigationController?.popViewController(animated: true)
                    return
                }
                controllers?.removeLast()
            }
        }
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    static func instantiate() -> BusinessDetailsController {
        return AppHelper.instantiate("WorkplaceList") as! BusinessDetailsController
    }
    
}

extension BusinessDetailsController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return workplaces == nil ? 0 : workplaces.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "WorkplaceCell", for: indexPath) as! ApplicationCell
        let workplace = workplaces[indexPath.row]
        
        AppHelper.loadLogo(workplace, imageView: cell.infoView.imgView, completion: nil)
        cell.infoView.titleLabel.text = workplace.name
        let jobCount = workplace.jobs.count
        if jobCount == 1 {
            cell.infoView.subTitleLabel.text = String(format: NSLocalizedString("Includes %lu job", comment: ""), jobCount)
        } else {
            cell.infoView.subTitleLabel.text = String(format: NSLocalizedString("Includes %lu jobs", comment: ""), jobCount)
        }
        
        
        if !business.restricted && !addMode {
            
            cell.rightButtons = [
                MGSwipeButton(title: "",
                              icon: UIImage(named: "delete-big-icon"),
                              backgroundColor: AppData.yellowColor,
                              padding: 20,
                              callback: { (cell) -> Bool in
                                
                                let message = jobCount == 0 ?
                                    String(format: NSLocalizedString("Are you sure you want to delete %@", comment: ""), workplace.name) :
                                    String(format: NSLocalizedString("Deleting this workplace will also delete %d jobs. If you want to hide the jobs instead you can deactive them.", comment: ""), jobCount)
                                PopupController.showYellow(message, ok: NSLocalizedString("Delete", comment: ""), okCallback: {
                                    
                                    cell.hideSwipe(animated: true)
                                    self.showLoading()
                                    AppData.removeWorkplace(workplace) { error in
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
                }),
                MGSwipeButton(title: "",
                              icon: UIImage(named: "edit-big-icon"),
                              backgroundColor: AppData.greenColor,
                              padding: 20,
                              callback: { (cell) -> Bool in
                                let controller = LocationEditController.instantiate()
                                controller.workplace = workplace
                                self.present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
                                return true
                })
            ]
            
        }
        
        cell.drawUnderline()
        
        return cell
    }    
}

extension BusinessDetailsController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let workplace = workplaces[indexPath.row]
        
        if addMode {
            addJob(workplace)
        } else {
            workplaceDetails(workplace, animated: true)
        }
    }
}
