//
//  JobListController.swift
//  MyJobPitch
//
//  Created by dev on 12/23/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class JobListController: SearchController {

    var location: Location!
    @IBOutlet weak var creditsLabel: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        if SideMenuController.currentID != "find_talent" {
            let addButton = UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(addAction))
            navigationItem.rightBarButtonItem = addButton
            navigationItem.title = "Jobs"
        }
        
        refresh()
        
        if location != nil {
            creditsLabel.text = String(format: "%@ Credit", location.businessData.tokens)
        }
        
    }
    
    func refresh() {
        
        AppHelper.showLoading("Loading...")
        
        API.shared().loadJobsForLocation(locationId: location?.id, success: { (data) in
            AppHelper.hideLoading()
            self.allData = data.mutableCopy() as! NSMutableArray
            self.data = self.allData
            self.tableView.reloadData()
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
        
    }
    
    override func filterItem(item: Any, text: String) -> Bool {
        
        let job  = item as! Job
        let businessName = job.locationData.businessData.name + ", " + job.locationData.name
        return  job.title.lowercased().contains(text) ||
                businessName.lowercased().contains(text) ||
                job.locationData.placeName.lowercased().contains(text)

    }
    
    func addAction(_ sender: Any) {
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobEdit") as! JobEditController
        controller.location = location
        controller.savedJob = refresh
        navigationController?.pushViewController(controller, animated: true)
        
    }
    
}

extension JobListController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let job = data[indexPath.row] as! Job
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "JobCell", for: indexPath) as! JobCell
        
        cell.setData(job)
        
        if SideMenuController.currentID != "find_talent" {
        
            cell.leftButtons = [
                MGSwipeButton(title: "",
                              icon: UIImage(named: "edit-big-icon"),
                              backgroundColor: AppData.greenColor,
                              padding: 20,
                              callback: { (cell) -> Bool in
                                
                                let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobEdit") as! JobEditController
                                controller.job = job
                                controller.savedJob = self.refresh
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
                                
                                let message = String(format: "Are you sure you want to delete %@", job.title)
                                PopupController.showYellow(message, ok: "Delete", okCallback: {
                                    
                                    AppHelper.showLoading("Deleting...")
                                    
                                    API.shared().deleteJob(id: job.id, success: {
                                        AppHelper.hideLoading()
                                        self.allData.remove(job)
                                        self.data.remove(job)
                                        self.tableView.reloadData()
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
            
        }
        
        return cell
    }
    
}

extension JobListController: UITableViewDelegate {

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        if SideMenuController.currentID == "find_talent" {
            
            let job = data[indexPath.row] as! Job
            
            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Swipe") as! SwipeController
            controller.searchJob = job
            navigationController?.pushViewController(controller, animated: true)
            
        }
        
    }
    
}
