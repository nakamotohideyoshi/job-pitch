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
    
    var radiusNames = [String]()
    var selectedRadiusNames = [String]()
    
    var latitude: NSNumber!
    var longitude: NSNumber!
    var placeID: String!
    var placeName: String!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        let iconView = UIImageView(image: UIImage(named: "location-icon"))
        iconView.contentMode = .scaleAspectFit
        iconView.frame = CGRect(x: 10, y: 7, width: 25, height: 26)
        locationButton.addSubview(iconView)
        
        // load profile
        
        if let profile = AppData.profile {
            load(profile)
        }
        
        // sector data
        
        for sector in AppData.sectors as! [Sector] {
            sectorNames.append(sector.name)
        }
        sectorsField.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.sectorNames,
                                          selectedItems: self.selectedSectorNames,
                                          multiSelection: true,
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
                                          doneCallback: { (items) in
                                            self.selectedContractNames = items
                                            self.contractField.text = items.joined(separator: ", ")
            })
        }
        
        if selectedContractNames.count == 0 {
            selectedContractNames.append("Any")
        }
        contractField.text = selectedContractNames.joined(separator: ", ")
        
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
                                          doneCallback: { (items) in
                                            self.selectedHoursNames = items
                                            self.hoursField.text = items.joined(separator: ", ")
            })
        }
        
        if selectedHoursNames.count == 0 {
            selectedHoursNames.append("Any")
        }
        hoursField.text = selectedHoursNames.joined(separator: ", ")
        
        // searchRadius data
        
        for i in 1...5 {
            radiusNames.append(String(format: "%d miles", i))
        }
        radiusField.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.radiusNames,
                                          selectedItems: self.selectedRadiusNames,
                                          multiSelection: false,
                                          doneCallback: { (items) in
                                            self.selectedRadiusNames = items
                                            self.radiusField.text = items.joined(separator: ", ")
            })
        }
        
        if selectedRadiusNames.count == 0 {
            selectedRadiusNames.append("5 miles")
        }
        radiusField.text = selectedRadiusNames.joined(separator: ", ")
        
    }
    
    override func getRequiredFields() -> [String: NSArray] {
        return [
            "sectors": [sectorsField, sectorsError],
            "location": [addressField, addressError]
        ]
    }
    
    
    func load(_ profile: Profile) {
        
        for sector in AppData.sectors as! [Sector] {
            if profile.sectors != nil && profile.sectors.contains(sector.id) {
                selectedSectorNames.append(sector.name)
            }
        }
        sectorsField.text = selectedSectorNames.joined(separator: ", ")
        
        // contract data
        
        for contract in AppData.contracts as! [Contract] {
            if profile.contract != nil && profile.contract == contract.id {
                selectedContractNames.append(contract.name)
                break
            }
        }
        
        // hours data
        
        for hours in AppData.hours as! [Hours] {
            if profile.hours != nil && profile.hours == hours.id {
                selectedHoursNames.append(hours.name)
                break
            }
        }
        
        // searchRadius data
        
        for i in 1...5 {
            let name = String(format: "%d miles", i)
            if profile.searchRadius != nil && profile.searchRadius == i as NSNumber {
                selectedRadiusNames.append(name)
                break
            }
        }
        
        latitude = profile.latitude
        longitude = profile.longitude
        placeID = profile.placeID
        placeName = profile.placeName
        
        addressField.text = placeName
        
    }
    
    @IBAction func myLocationAction(_ sender: Any) {
        
        LocationMapController.showModal(latitude: latitude, longitude: longitude,
                                        complete: { (locationCoordinate, placeID, placeName) in
                                            self.latitude = locationCoordinate.latitude as NSNumber!
                                            self.longitude = locationCoordinate.longitude as NSNumber!
                                            self.placeID = placeID
                                            self.placeName = placeName
                                            self.addressField.text = placeName
        })
        
    }
    
    @IBAction func saveAction(_ sender: Any) {
        
        if !validate() {
            return
        }
        
        AppHelper.showLoading("Saving...")
        
        let profile = Profile()
        
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
        for i in 1...5 {
            if radiusName == String(format: "%d miles", i) {
                profile.searchRadius = i as NSNumber
                break
            }
        }
        
        profile.latitude = latitude
        profile.longitude = longitude
        profile.placeID = placeID
        profile.placeName = placeName
        
        profile.jobSeeker = AppData.user.jobSeeker
        profile.id = AppData.profile?.id
        
        API.shared().saveJobProfile(profile: profile, success: { (data) in
            
            PopupController.showGreen("Success!", ok: "OK", okCallback: {
                
                if AppData.profile == nil {
                    SideMenuController.pushController(id: "find_job")
                }
                AppData.profile = data as! Profile
                
            }, cancel: nil, cancelCallback: nil)
            
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
        
    }
    
}
