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
    
    var locationManager: CLLocationManager!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        addressField.delegate = self
        locationManager = CLLocationManager()
        locationManager.delegate = self as? CLLocationManagerDelegate
        
        let iconView = UIImageView(image: UIImage(named: "location-icon"))
        iconView.contentMode = .scaleAspectFit
        iconView.frame = CGRect(x: 10, y: 7, width: 25, height: 26)
        locationButton.addSubview(iconView)
        
        // sector data
        
        sectorNames = AppData.sectors.map { $0.name }
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
        
        contractNames = AppData.contracts.map { $0.name }
        contractNames.insert("Any", at: 0)
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
        
        hoursNames = AppData.hours.map { $0.name }
        hoursNames.insert("Any", at: 0)
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
        radiusNames = radiusData.map { $0.1 }
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
        
        load()
    }
    
    override func getRequiredFields() -> [String: (UIView, UILabel)] {
        return [
            "sectors":      (sectorsField, sectorsError),
            "location":     (addressField, addressError)
        ]
    }
    
    func load() {
        
        let profile = AppData.profile
        
        if profile?.sectors != nil {
            selectedSectorNames = (AppData.sectors.filter { (profile?.sectors.contains($0.id))! }).map { $0.name }
        }
        sectorsField.text = selectedSectorNames.joined(separator: ", ")
        
        // contract data
        
        if profile?.contract != nil {
            selectedContractNames = (AppData.contracts.filter { $0.id == profile?.contract }).map { $0.name }
        }
        if selectedContractNames.count == 0 {
            selectedContractNames.append("Any")
        }
        contractField.text = selectedContractNames.joined(separator: ", ")
        
        // hours data
        
        if profile?.hours != nil {
            selectedHoursNames = (AppData.hours.filter { $0.id == profile?.hours }).map { $0.name }
        }
        if selectedHoursNames.count == 0 {
            selectedHoursNames.append("Any")
        }
        hoursField.text = selectedHoursNames.joined(separator: ", ")
        
        // searchRadius data
        
        if profile?.searchRadius != nil {
            selectedRadiusNames = (radiusData.filter { ($0.0 as NSNumber) == profile?.searchRadius }).map { $0.1 }
        }
        if selectedRadiusNames.count == 0 {
            selectedRadiusNames.append(radiusData[2].1)
        }
        radiusField.text = selectedRadiusNames.joined(separator: ", ")
        
        if profile != nil {
            latitude = profile?.latitude
            longitude = profile?.longitude
            placeID = profile?.placeID
            placeName = profile?.placeName
            addressField.text = placeName
        }
    }
    
    @IBAction func myLocationAction(_ sender: Any) {
        
        let radiusName = selectedRadiusNames[0]
        var radius: Double = 1
        for (value, name) in radiusData {
            if radiusName == name {
                radius = Double(value)
                break
            }
        }
        
        let controller = MapController.instantiate()
        if latitude != nil {
            controller.currentPos = CLLocationCoordinate2DMake(latitude as CLLocationDegrees, longitude as CLLocationDegrees)
        }
        controller.radius = radius * 1609.34;
        controller.complete = { (locationCoordinate, placeID, placeName) in
            self.latitude = locationCoordinate.latitude as NSNumber!
            self.longitude = locationCoordinate.longitude as NSNumber!
            self.placeID = placeID
            self.placeName = placeName
            self.addressField.text = placeName
        }
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    @IBAction func saveAction(_ sender: Any) {
        
        if !valid() {
            return
        }
        
        showLoading()
        
        let profile = Profile()
        profile.jobSeeker = AppData.jobSeeker.id
        
        // sector data
        
        profile.sectors = (AppData.sectors.filter { selectedSectorNames.contains($0.name) }).map { $0.id } as NSArray
        
        // contract data
        
        profile.contract = AppData.getIdByName(AppData.contracts, name: selectedContractNames[0])
        
        // hours data
        
        profile.hours = AppData.getIdByName(AppData.hours, name: selectedHoursNames[0])
        
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
        
        API.shared().saveJobProfile(profile) { (result, error) in
            
            if error != nil {
                self.handleError(error)
                return
            }
            
            self.hideLoading()
            
            AppData.profile = result as! Profile
            
            PopupController.showGreen("Success!", ok: "OK", okCallback: {
                if AppData.jobSeeker.profile == nil {
                    AppData.jobSeeker.profile = AppData.profile.id
                    if AppData.jobSeeker.getPitch() == nil {
                        SideMenuController.pushController(id: "add_record")
                    } else {
                        SideMenuController.pushController(id: "find_job")
                    }
                }
            }, cancel: nil, cancelCallback: nil)
        }
        
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
