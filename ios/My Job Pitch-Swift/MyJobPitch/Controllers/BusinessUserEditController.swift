//
//  BusinessUserEditController.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/21/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class BusinessUserEditController: MJPController {

    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var saveButton: GreenButton!
    @IBOutlet weak var createButton: GreenButton!
    @IBOutlet weak var isAdministrator: UISwitch!
    @IBOutlet weak var emailAddress: UITextField!
    @IBOutlet weak var locationTitle: UILabel!
    @IBOutlet weak var locationNames: UITextField!
    
    var isEditMode = false
    var businessUser: BusinessUser!
    var businessId: NSNumber!
    
    var locations: [Location]!
    var isSelectedLocation: [Bool]!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        createButton.isHidden = isEditMode
        saveButton.isHidden = !isEditMode
        
        if isEditMode {
            isAdministrator.isOn = businessUser.locations.count == 0
            emailAddress.text = businessUser.email
            emailAddress.isEnabled = false
        } else {
            isAdministrator.isOn = false
            emailAddress.text = ""
            emailAddress.isEnabled = true
        }
        
        locationNames.isEnabled = !isAdministrator.isOn
        
        
        if isSelectedLocation == nil {
            isSelectedLocation = Array(repeating: false, count: locations.count)
            if isEditMode {
                for i in 0...locations.count-1 {
                    if businessUser.locations.contains(locations[i].id) {
                        isSelectedLocation[i] = true
                    }
                }
            }
        }
        
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    @IBAction func createAction(_ sender: Any) {
        
        showLoading()
        
        let businessUserForCreation = BusinessUserForCreation()
        
        businessUserForCreation.email = emailAddress.text
        
        var selectedLocations = [NSNumber]()
        
        if !isAdministrator.isOn {
            for i in 0...locations.count-1 {
                if isSelectedLocation[i] {
                    selectedLocations.append(locations[i].id)
                }
            }
        }
        
        businessUserForCreation.locations = selectedLocations as NSArray
        
        API.shared().createBusinessUser(businessId: businessId, businessUser: businessUserForCreation, success: { (data) in
            self.hideLoading()
            _ = self.navigationController?.popViewController(animated: true)
            return
        }, failure: self.handleErrors)
        
        
        
    }
    @IBAction func setAdministrator(_ sender: Any) {
        isAdministrator.isOn = !isAdministrator.isOn
    }
    
    @IBAction func deleteAction(_ sender: Any) {
        
        showLoading()
        
        API.shared().deleteBusinessUser(businessId: businessId, businessUserId: businessUser.id, success: { (data) in
            self.hideLoading()
            _ = self.navigationController?.popViewController(animated: true)
            return
        }, failure: self.handleErrors)
    }
    
    @IBAction func saveAction(_ sender: Any) {
        
        showLoading()
        
        let businessUserForUpdate = BusinessUserForUpdate()
        
        var selectedLocations = [NSNumber]()
        
        if !isAdministrator.isOn {
            for i in 0...locations.count-1 {
                if isSelectedLocation[i] {
                    selectedLocations.append(locations[i].id)
                }
            }
        }
        
        businessUserForUpdate.locations = selectedLocations as NSArray
        
        API.shared().updateBusinessUser(businessId: businessId, businessUserId: businessUser.id, businessUser: businessUserForUpdate, success: { (data) in
            self.hideLoading()
            _ = self.navigationController?.popViewController(animated: true)
            return
        }, failure: self.handleErrors)
    }
}

extension BusinessUserEditController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return locations.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let location = locations[indexPath.row]
        let cell = tableView.dequeueReusableCell(withIdentifier: "BusinessUserEditCell", for: indexPath)
        
        cell.textLabel?.text = location.name
        
    
        if isSelectedLocation[indexPath.row]{
            cell.accessoryType = .checkmark
            cell.isSelected = true
        } else  {
            cell.accessoryType = .none
            cell.isSelected = false
        }
        
        cell.addUnderLine(paddingLeft: 15, paddingRight: 0, color: AppData.greyBorderColor)
        
        return cell
        
    }
    
}

extension BusinessUserEditController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        isSelectedLocation[indexPath.row] = !isSelectedLocation[indexPath.row]
        tableView.reloadData()
    }
    
    func tableView(_ tableView: UITableView, didDeselectRowAt indexPath: IndexPath) {
        isSelectedLocation[indexPath.row] = false
        tableView.reloadData()
    }
    
}

