//
//  BusinessUserEditController.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/21/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class BusinessUserEditController: MJPController {
    @IBOutlet weak var saveButton: GreenButton!
    @IBOutlet weak var isAdministrator: UISwitch!
    @IBOutlet weak var emailAddress: UITextField!
    @IBOutlet weak var workPlaceSelector: ButtonTextField!
    @IBOutlet weak var emailError: UILabel!
    @IBOutlet weak var workplaceError: UILabel!
    @IBOutlet weak var deleteButton: YellowButton!
    @IBOutlet weak var resendButton: GreenButton!
    
    var isEditMode = false
    var businessUser: BusinessUser!
    var businessId: NSNumber!
    
    var locations: [Location]!
    var isSelectedLocation: [Bool]!
    
    var locationNames = [String]()
    var selectedLocationsNames = [String]()
    var selectedLocations = [NSNumber]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        deleteButton.isHidden = !isEditMode
        resendButton.isHidden = !isEditMode
        
        if isEditMode {
            isAdministrator.isOn = businessUser.locations.count == 0
            emailAddress.text = businessUser.email
            emailAddress.isEnabled = false
            emailAddress.textColor = UIColor.darkGray
        } else {
            isAdministrator.isOn = false
            emailAddress.text = ""
            emailAddress.isEnabled = true
            emailAddress.textColor = UIColor.black
            saveButton.setTitle("Send Invitation", for: .normal)
        }
        
        workPlaceSelector.isEnabled = !isAdministrator.isOn
        
        for location in locations {
            locationNames.append(location.name)
            if isEditMode {
                if businessUser.locations.contains(location.id) {
                    selectedLocationsNames.append(location.name)
                }
            }
        }
        
        if isEditMode {
            workPlaceSelector.text = selectedLocationsNames.joined(separator: ", ")
        }
        workPlaceSelector.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.locationNames,
                                          selectedItems: self.selectedLocationsNames,
                                          multiSelection: true,
                                          search: true,
                                          doneCallback: { (items) in
                                            self.selectedLocationsNames = items
                                            self.selectedLocations.removeAll()
                                            for item in items {
                                                if let index = self.locationNames.index(of: item) {
                                                    if index > -1 {
                                                        self.selectedLocations.append(self.locations[index].id)
                                                    }
                                                }
                                            }
                                            self.workPlaceSelector.text = items.joined(separator: ", ")
            })
        }

        
    }
    
    @IBAction func setAdministrator(_ sender: Any) {
        isAdministrator.isOn = !isAdministrator.isOn
        workPlaceSelector.isEnabled = !isAdministrator.isOn
    }
    
    @IBAction func deleteAction(_ sender: Any) {
        
        showLoading()
        
        API.shared().deleteBusinessUser(businessId: businessId, businessUserId: businessUser.id, success: { (data) in
            self.hideLoading()
            _ = self.navigationController?.popViewController(animated: true)
            return
        }, failure: self.handleErrors)
    }
    
    @IBAction func resendInvitation(_ sender: Any) {
        
        showLoading()
        
        let businessUserForCreation = BusinessUserForCreation()
        businessUserForCreation.email = businessUser.email
        businessUserForCreation.locations = businessUser.locations
        
        API.shared().reCreateBusinessUser(businessId: businessId, businessUserId: businessUser.id, businessUser: businessUserForCreation, success: { (data) in
            self.hideLoading()
            _ = self.navigationController?.popViewController(animated: true)
            return
        }, failure: self.handleErrors)
    }
    
    @IBAction func saveAction(_ sender: Any) {
        
        if !isAdministrator.isOn && selectedLocations.count == 0 {
            PopupController.showGreen("You must select at least one work place.", ok: "Ok", okCallback: {
            }, cancel: "Cancel", cancelCallback: {
                
            })
        } else {
        
            showLoading()
            
            if isEditMode {
                
                let businessUserForUpdate = BusinessUserForUpdate()
                businessUserForUpdate.locations = isAdministrator.isOn ? [] : selectedLocations as NSArray
                
                API.shared().updateBusinessUser(businessId: businessId, businessUserId: businessUser.id, businessUser: businessUserForUpdate, success: { (data) in
                    self.hideLoading()
                    _ = self.navigationController?.popViewController(animated: true)
                    return
                }, failure: self.handleErrors)
                
            } else  {
                
                let businessUserForCreation = BusinessUserForCreation()
                businessUserForCreation.email = emailAddress.text
                businessUserForCreation.locations = isAdministrator.isOn ? [] : selectedLocations as NSArray
                
                API.shared().createBusinessUser(businessId: businessId, businessUser: businessUserForCreation, success: { (data) in
                    self.hideLoading()
                    _ = self.navigationController?.popViewController(animated: true)
                    return
                }, failure: self.handleErrors)
                
            }
        }
    }
}

