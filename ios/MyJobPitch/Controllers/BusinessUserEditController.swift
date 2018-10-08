//
//  BusinessUserEditController.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/21/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class BusinessUserEditController: MJPController {
    @IBOutlet weak var emailAddress: UITextField!
    @IBOutlet weak var emailError: UILabel!
    @IBOutlet weak var isAdministrator: UISwitch!
    @IBOutlet weak var workPlaceSelector: ButtonTextField!
    @IBOutlet weak var workplaceError: UILabel!
    @IBOutlet weak var saveButton: GreenButton!
    @IBOutlet weak var resendButton: GreenButton!
    @IBOutlet weak var deleteButton: YellowButton!
    
    var business: Business!
    var businessUser: BusinessUser!
    
    var locationNames = [String]()
    var selectedLocationsNames = [String]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setTitle(title: businessUser == nil ? "Create User" : "Edit User", subTitle: business.name)
        isModal = true
        
        locationNames = AppData.workplaces.map { $0.name }
        
        if businessUser != nil {
            emailAddress.isEnabled = false
            emailAddress.text = businessUser.email
            isAdministrator.isOn = businessUser.locations.count == 0
            workPlaceSelector.superview?.isHidden = isAdministrator.isOn
            
            selectedLocationsNames = (AppData.workplaces.filter { businessUser.locations.contains($0.id) }).map { $0.name }
            workPlaceSelector.text = selectedLocationsNames.joined(separator: ", ")
            
            saveButton.setTitle("Save", for: .normal)
            resendButton.superview?.isHidden = false
            deleteButton.superview?.isHidden = false
        }
        
        workPlaceSelector.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.locationNames,
                                          selectedItems: self.selectedLocationsNames,
                                          multiSelection: true,
                                          search: false,
                                          doneCallback: { (items) in
                                            self.selectedLocationsNames = items
                                            self.workPlaceSelector.text = items.joined(separator: ", ")
            })
        }
    }
    
    override func getRequiredFields() -> [String: (UIView, UILabel)] {
        return [
            "email":    (emailAddress, emailError)
        ]
    }
        
    @IBAction func administratorAction(_ sender: Any) {
        isAdministrator.isOn = !isAdministrator.isOn
        workPlaceSelector.superview?.isHidden = isAdministrator.isOn
        selectedLocationsNames = []
    }
    
    @IBAction func saveAction(_ sender: Any) {
        workplaceError.text = !isAdministrator.isOn && selectedLocationsNames.count == 0 ? "This field is required." : ""
        
        if !valid() || workplaceError.text != "" {
            return
        }
        
        showLoading()
        
        let locations = (AppData.workplaces.filter { selectedLocationsNames.contains($0.name) }).map { $0.id }
        
        if businessUser == nil {
            let businessUserForCreation = BusinessUserForCreation()
            businessUserForCreation.email = emailAddress.text
            businessUserForCreation.locations = locations as NSArray!
            
            API.shared().createBusinessUser(businessId: business.id, businessUser: businessUserForCreation) { (_, error) in
                if error != nil {
                    self.handleError(error)
                    return
                }

                AppData.getBusinessUsers(businessId: self.business.id) { error in
                    if error == nil {
                        self.closeController()
                    } else {
                        self.handleError(error)
                    }
                }
            }
        } else {
            let businessUserForUpdate = BusinessUserForUpdate()
            businessUserForUpdate.locations = locations as NSArray!
            
            API.shared().updateBusinessUser(businessId: business.id, businessUserId: businessUser.id, businessUser: businessUserForUpdate) { (_, error) in
                if error != nil {
                    self.handleError(error)
                    return
                }

                AppData.getBusinessUser(businessId: self.business.id, userId: self.businessUser.id) { (_, error) in
                    if error == nil {
                        self.closeController()
                    } else {
                        self.handleError(error)
                    }
                }
            }
        }
    }
    
    @IBAction func resendInvitation(_ sender: Any) {
        showLoading()
        
        let businessUserForCreation = BusinessUserForCreation()
        businessUserForCreation.email = businessUser.email
        businessUserForCreation.locations = businessUser.locations
        
        API.shared().reCreateBusinessUser(businessId: business.id, businessUserId: businessUser.id, businessUser: nil) { (_, error) in
            if error == nil {
                self.closeController()
            } else {
                self.handleError(error)
            }
        }
    }
    
    @IBAction func deleteAction(_ sender: Any) {
        let message = String(format: "Are you sure you want to delete %@", businessUser.email)
        PopupController.showYellow(message, ok: "Delete", okCallback: {
            self.showLoading()
            
            API.shared().deleteBusinessUser(businessId: self.business.id, businessUserId: self.businessUser.id) { (error) in
                if error == nil {
                    AppData.removeBusinessUser(self.businessUser.id)
                    self.closeController()
                } else {
                    self.handleError(error)
                }
            }
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    static func instantiate() -> BusinessUserEditController {
        return AppHelper.instantiate("BusinessUserEdit") as! BusinessUserEditController
    }
}

