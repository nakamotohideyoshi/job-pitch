//
//  LocationEditController.swift
//  MyJobPitch
//
//  Created by dev on 12/13/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit
import GoogleMaps

class LocationEditController: MJPController {
    
    @IBOutlet weak var nameField: UITextField!
    @IBOutlet weak var nameErrorLabel: UILabel!
    @IBOutlet weak var descTextView: BorderTextView!
    @IBOutlet weak var descError: UILabel!
    @IBOutlet weak var emailField: UITextField!
    @IBOutlet weak var emailError: UILabel!
    @IBOutlet weak var emailPublic: UISwitch!
    @IBOutlet weak var phoneField: UITextField!
    @IBOutlet weak var phonePublic: UISwitch!
    @IBOutlet weak var addressField: UITextField!
    @IBOutlet weak var addressError: UILabel!
    @IBOutlet weak var locationButton: YellowButton!
    @IBOutlet weak var logoView: UIImageView!
    
    public var business: Business!
    public var workplace: Location!
    public var saveComplete: ((Location) -> Void)?
    
    var logoPicker: ImagePicker!
    var logoImage: UIImage!
    
    var latitude: NSNumber!
    var longitude: NSNumber!
    var placeID: String!
    var placeName: String!
    
    var addMode = false
    var isNew = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        isModal = true
        
        logoPicker = ImagePicker()
        logoPicker.delegate = self
        
        addMode = SideMenuController.currentID != "businesses"
        
        addressField.delegate = self
        
        if workplace == nil {
            isNew = true
            
            title = "Add Workplace"
            logoView.image = UIImage(named: "default-logo")
            emailField.text = AppData.email
            
        } else {
            
            title = "Edit Workplace"
            business = workplace.businessData
            AppHelper.loadLogo(workplace, imageView: logoView, completion: nil)
            nameField.text = workplace.name
            descTextView.text = workplace.desc
            emailField.text = workplace.email
            emailPublic.isOn = workplace.emailPublic
            phoneField.text = workplace.mobile
            phonePublic.isOn = workplace.mobilePublic
            addressField.text = workplace.placeName
            placeID = workplace.placeID
            placeName = workplace.placeName
            latitude = workplace.latitude
            longitude = workplace.longitude
            
        }
        
        let iconView = UIImageView(image: UIImage(named: "location-icon"))
        iconView.contentMode = .scaleAspectFit
        iconView.frame = CGRect(x: 10, y: 7, width: 25, height: 26)
        locationButton.addSubview(iconView)
    }
    
    override func getRequiredFields() -> [String: NSArray] {
        return [
            "location_name":        [nameField,    nameErrorLabel],
            "location_description": [descTextView, descError],
            "location_email":       [emailField,   emailError],
            "location_location":    [addressField, addressError]
        ]
    }
    
    @IBAction func emailHelp(_ sender: Any) {
        PopupController.showGray("The is the email that notifications will be sent to, it can be different to your login email address.", ok: "Close")
    }
    
    @IBAction func addLogoAction(_ sender: Any) {
        logoPicker.present(self, target: sender as! UIView)
    }
    
    @IBAction func myLocationAction(_ sender: Any) {
        
        let controller = MapController.instantiate()
        if latitude != nil {
            controller.currentPos = CLLocationCoordinate2DMake(latitude as CLLocationDegrees, longitude as CLLocationDegrees)
        }
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
        
        if workplace == nil {
            workplace = Location()
            workplace.business = business.id
        }
        
        workplace.name = nameField.text?.trimmingCharacters(in: .whitespacesAndNewlines)
        workplace.desc = descTextView.text?.trimmingCharacters(in: .whitespacesAndNewlines)
        workplace.email = emailField.text?.trimmingCharacters(in: .whitespacesAndNewlines)
        workplace.emailPublic = emailPublic.isOn
        workplace.telephone = ""
        workplace.telephonePublic = false
        workplace.mobile = phoneField.text;
        workplace.mobilePublic = phonePublic.isOn
        workplace.placeID = placeID
        workplace.placeName = placeName
        workplace.latitude = latitude
        workplace.longitude = longitude
        workplace.address = ""
        
        API.shared().saveLocation(location: workplace, success: { (data) in
            
            self.workplace = data as! Location
            
            if self.logoImage != nil {
                
                self.showLoading(label: "Uploading...")
                
                API.shared().uploadImage(image: self.logoImage,
                                         endpoint: "user-location-images",
                                         objectKey: "location",
                                         objectId: self.workplace.id,
                                         order: 0,
                                         progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                            self.showLoading(label: "", withProgress: Float(totalBytesWritten) / Float(totalBytesExpectedToWrite))
                }, success: { (data) in
                    self.saveFinished()
                }, failure: self.handleErrors)
                
            } else {
                self.saveFinished()
            }
            
        }, failure: handleErrors)
        
    }
    
    func saveFinished() {
        
        AppData.updateWorkplace(workplace.id, success: { (workplace) in
            
            if self.isNew && UserDefaults.standard.integer(forKey: "tutorial") == 1 {
                UserDefaults.standard.set(2, forKey: "tutorial")
                UserDefaults.standard.synchronize()
            }
            
            self.closeModal()
            self.saveComplete?(self.workplace)
            
        }, failure: handleErrors)
    }
    
    static func instantiate() -> LocationEditController {
        return AppHelper.instantiate("LocationEdit") as! LocationEditController
    }
    
}

extension LocationEditController: UITextFieldDelegate {
    func textFieldShouldBeginEditing(_ textField: UITextField) -> Bool {
        if addressField == textField {
            myLocationAction(textField)
        }
        return false
    }
}

extension LocationEditController: ImagePickerDelegate {
    
    func imageSelected(_ picker: ImagePicker, image: UIImage) {
        logoImage = image
        logoView.image = image
    }
}
