//
//  JobProfileController.swift
//  MyJobPitch
//
//  Created by dev on 12/27/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import STPopup
import CoreLocation

class JobProfileController: MJPController {
    
    @IBOutlet weak var sectorsField: ButtonTextField!
    @IBOutlet weak var sectorsError: UILabel!
    @IBOutlet weak var contractField: ButtonTextField!
    @IBOutlet weak var hoursField: ButtonTextField!
    @IBOutlet weak var addressField: UITextField!
    @IBOutlet weak var addressError: UILabel!
    @IBOutlet weak var locationButton: YellowButton!
    @IBOutlet weak var radiusField: ButtonTextField!
    
    var sectorNames = [String]()
    var selectedSectorNames = [String]()
    
    var contractNames = [String]()
    var selectedContractNames = [String]()
    
    var hoursNames = [String]()
    var selectedHoursNames = [String]()
    
    var radiusData = [(1, "1 mile"), (2, "2 miles"), (5, "5 miles"), (10, "10 miles"), (50, "50 miles")]
    var radiusNames = [String]()
    var selectedRadiusNames = [String]()
    
    var latitude: NSNumber!
    var longitude: NSNumber!
    var placeID: String!
    var placeName: String!
    
    var jobSeeker: JobSeeker!
    var profile: Profile!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        addressField.delegate = self
        
        let iconView = UIImageView(image: UIImage(named: "location-icon"))
        iconView.contentMode = .scaleAspectFit
        iconView.frame = CGRect(x: 10, y: 7, width: 25, height: 26)
        locationButton.addSubview(iconView)
        
        // sector data
        
        for sector in AppData.sectors as! [Sector] {
            sectorNames.append(sector.name)
        }
        sectorsField.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.sectorNames,
                                          selectedItems: self.selectedSectorNames,
                                          multiSelection: true,
                                          search: true,
                                          doneCallback: { (items) in
                                            self.selectedSectorNames = items
                                            self.sectorsField.text = items.joined(separator: ", ")
            })
        }
        
        // contract data
        
        contractNames.append("Any")
        for contract in AppData.contracts as! [Contract] {
            contractNames.append(contract.name)
        }
        contractField.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.contractNames,
                                          selectedItems: self.selectedContractNames,
                                          multiSelection: false,
                                          search: false,
                                          doneCallback: { (items) in
                                            self.selectedContractNames = items
                                            self.contractField.text = items.joined(separator: ", ")
            })
        }
        
        // hours data
        
        hoursNames.append("Any")
        for hours in AppData.hours as! [Hours] {
            hoursNames.append(hours.name)
        }
        hoursField.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.hoursNames,
                                          selectedItems: self.selectedHoursNames,
                                          multiSelection: false,
                                          search: false,
                                          doneCallback: { (items) in
                                            self.selectedHoursNames = items
                                            self.hoursField.text = items.joined(separator: ", ")
            })
        }
        
        // searchRadius data
        
        for (_, name) in radiusData {
            radiusNames.append(name)
        }
        radiusField.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.radiusNames,
                                          selectedItems: self.selectedRadiusNames,
                                          multiSelection: false,
                                          search: false,
                                          doneCallback: { (items) in
                                            self.selectedRadiusNames = items
                                            self.radiusField.text = items.joined(separator: ", ")
            })
        }
        
        // load profile
        
        AppHelper.showLoading("Loading...")
        API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
            self.jobSeeker = data as! JobSeeker
            if self.jobSeeker.profile != nil {
                AppData.existProfile = true
                API.shared().loadJobProfileWithId(id: self.jobSeeker.profile, success: { (data) in
                    AppHelper.hideLoading()
                    self.profile = data as! Profile
                    self.load()
                }, failure: self.handleErrors)
            } else {
                AppHelper.hideLoading()
                self.load()
            }
            
        }, failure: self.handleErrors)

    }
    
    override func getRequiredFields() -> [String: NSArray] {
        return [
            "sectors": [sectorsField, sectorsError],
            "location": [addressField, addressError]
        ]
    }
    
    
    func load() {
        
        if profile?.sectors != nil {
            for sector in AppData.sectors as! [Sector] {
                if profile.sectors.contains(sector.id) {
                    selectedSectorNames.append(sector.name)
                }
            }
        }
        
        sectorsField.text = selectedSectorNames.joined(separator: ", ")
        
        // contract data
        
        if profile?.contract != nil {
            for contract in AppData.contracts as! [Contract] {
                if profile.contract == contract.id {
                    selectedContractNames.append(contract.name)
                    break
                }
            }
        }
        
        if selectedContractNames.count == 0 {
            selectedContractNames.append("Any")
        }
        contractField.text = selectedContractNames.joined(separator: ", ")
        
        // hours data
        
        if profile?.hours != nil {
            for hours in AppData.hours as! [Hours] {
                if profile.hours == hours.id {
                    selectedHoursNames.append(hours.name)
                    break
                }
            }
        }
        
        if selectedHoursNames.count == 0 {
            selectedHoursNames.append("Any")
        }
        hoursField.text = selectedHoursNames.joined(separator: ", ")
        
        // searchRadius data
        
        if profile?.searchRadius != nil {
            for (value, name) in radiusData {
                if profile.searchRadius == value as NSNumber {
                    selectedRadiusNames.append(name)
                    break
                }
            }
        }
        
        if selectedRadiusNames.count == 0 {
            selectedRadiusNames.append(radiusData[2].1)
        }
        radiusField.text = selectedRadiusNames.joined(separator: ", ")
        
        if profile != nil {
            latitude = profile.latitude
            longitude = profile.longitude
            placeID = profile.placeID
            placeName = profile.placeName
            addressField.text = placeName
        }
        
    }
    
    @IBAction func myLocationAction(_ sender: Any) {
        
        MapController.showModal(latitude: latitude, longitude: longitude,
                                        complete: { (locationCoordinate, placeID, placeName) in
                                            self.latitude = locationCoordinate.latitude as NSNumber!
                                            self.longitude = locationCoordinate.longitude as NSNumber!
                                            self.placeID = placeID
                                            self.placeName = placeName
                                            self.addressField.text = placeName
        })
        
    }
    
    @IBAction func saveAction(_ sender: Any) {
        
        if !valid() {
            return
        }
        
        AppHelper.showLoading("Saving...")
        
        if profile == nil {
            profile = Profile()
            profile.jobSeeker = AppData.user.jobSeeker
        }
        
        // sector data
        
        let sectors = NSMutableArray()
        for sector in AppData.sectors as! [Sector] {
            if selectedSectorNames.contains(sector.name) {
                sectors.add(sector.id)
            }
        }
        profile.sectors = sectors
        
        // contract data
        
        let contractName = selectedContractNames[0]
        for contract in AppData.contracts as! [Contract] {
            if contractName == contract.name {
                profile.contract = contract.id
                break
            }
        }
        
        // hours data
        
        let hoursName = selectedHoursNames[0]
        for hours in AppData.hours as! [Hours] {
            if hoursName == hours.name {
                profile.hours = hours.id
                break
            }
        }
        
        // searchRadius data
        
        let radiusName = selectedRadiusNames[0]
        for (value, name) in radiusData {
            if radiusName == name {
                profile.searchRadius = value as NSNumber!
                break
            }
        }
        
        profile.latitude = latitude
        profile.longitude = longitude
        profile.placeID = placeID
        profile.placeName = placeName
        profile.postcodeLookup = ""
        
        API.shared().saveJobProfile(profile: profile, success: { (data) in
            
            self.profile = data as! Profile
            
            PopupController.showGreen("Success!", ok: "OK", okCallback: {
                if self.jobSeeker.profile == nil {
                    AppData.existProfile = true
                    if self.jobSeeker.getPitch() == nil {
                        SideMenuController.pushController(id: "add_record")
                    } else {
                        SideMenuController.pushController(id: "find_job")
                    }
                }
            }, cancel: nil, cancelCallback: nil)
            
        }, failure: self.handleErrors)
        
    }
    
}

extension JobProfileController: UITextFieldDelegate {
    func textFieldShouldBeginEditing(_ textField: UITextField) -> Bool {
        if addressField == textField {
            myLocationAction(textField)
        }
        return false
    }
}
