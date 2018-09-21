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
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var addLogoButton: UIButton!
    @IBOutlet weak var removeImageButton: UIButton!
    
    var business: Business!
    var location: Location!
    
    var logoPicker: ImagePicker!
    var logoImage: UIImage!
    
    var latitude: NSNumber!
    var longitude: NSNumber!
    var placeID: String!
    var placeName: String!
    
    var origImage: Image!
    
    var isFirstCreate = false
    var isNew = false
    var isAddMode = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        logoPicker = ImagePicker()
        logoPicker.delegate = self
        
        addressField.delegate = self
        
        let iconView = UIImageView(image: UIImage(named: "location-icon"))
        iconView.contentMode = .scaleAspectFit
        iconView.frame = CGRect(x: 10, y: 7, width: 25, height: 26)
        locationButton.addSubview(iconView)
        
        //imgView.addDotBorder(dotWidth: 4, color: UIColor.black)
        
        isFirstCreate = UserDefaults.standard.bool(forKey: "first_craete_wp")
        isAddMode = SideMenuController.currentID != "businesses"
        
        if location == nil {
            navigationItem.title = "Add Workplace"
            isNew = true
            
            showLoading()
            API.shared().loadLocationsForBusiness(businessId: nil, success: { (data) in
                self.hideLoading()
                self.isFirstCreate = data.count == 0
                if !self.isFirstCreate {
                    UserDefaults.standard.set(false, forKey: "first_craete_wp")
                    UserDefaults.standard.synchronize()
                }
                self.load()
            }, failure: self.handleErrors)
        } else {
            navigationItem.title = "Edit Workplace"
            business = location.businessData
            
            showLoading()
            API.shared().loadLocation(id: location.id, success: { (data) in
                self.hideLoading()
                self.location = data as! Location
                self.load()
            }, failure: self.handleErrors)
        }
        
    }
    
    func load() {
        
        if location != nil {
            
            nameField.text = location.name
            descTextView.text = location.desc
            emailField.text = location.email
            emailPublic.isOn = location.emailPublic
            phoneField.text = location.mobile
            phonePublic.isOn = location.mobilePublic
            addressField.text = location.placeName
            placeID = location.placeID
            placeName = location.placeName
            latitude = location.latitude
            longitude = location.longitude
            
            AppHelper.loadLogo(location, imageView: imgView, completion: {
                if self.location.images != nil && self.location.images.count > 0 {
                    self.origImage = self.location.getImage()
                    self.removeImageButton.isHidden = false
                    self.addLogoButton.setTitle("Change Logo", for: .normal)
                }
            })            
        } else {
            emailField.text = AppData.email
            imgView.image = UIImage(named: "default-logo")
        }
        
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
    
    @IBAction func removeImageAction(_ sender: Any) {
        
        logoImage = nil
        AppHelper.loadLogo(business, imageView: imgView, completion: nil)
        addLogoButton.setTitle("Add Logo", for: .normal)
        removeImageButton.isHidden = true        
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
        
        if location == nil {
            location = Location()
            location.business = business.id
        }
        
        location.name = nameField.text?.trimmingCharacters(in: .whitespacesAndNewlines)
        location.desc = descTextView.text?.trimmingCharacters(in: .whitespacesAndNewlines)
        location.email = emailField.text?.trimmingCharacters(in: .whitespacesAndNewlines)
        location.emailPublic = emailPublic.isOn
        location.telephone = ""
        location.telephonePublic = false
        location.mobile = phoneField.text;
        location.mobilePublic = phonePublic.isOn
        location.placeID = placeID
        location.placeName = placeName
        location.latitude = latitude
        location.longitude = longitude
        location.address = ""
        
        API.shared().saveLocation(location: location, success: { (data) in
            
            if self.logoImage != nil {
                
                self.showLoading(label: "Uploading...")
                
                API.shared().uploadImage(image: self.logoImage,
                                         endpoint: "user-location-images",
                                         objectKey: "location",
                                         objectId: self.location.id,
                                         order: 0,
                                         progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                            self.showLoading(label: "", withProgress: Float(totalBytesWritten) / Float(totalBytesExpectedToWrite))
                }, success: { (data) in
                    self.saveFinished()
                }, failure: self.handleErrors)
                
            } else if self.origImage?.id != nil && self.removeImageButton.isHidden {
                
                API.shared().deleteImage(id: (self.origImage?.id)!, endpoint: "user-location-images", success: {
                    self.saveFinished()
                }, failure: self.handleErrors)
                
            } else {
                self.saveFinished()
            }
            
        }, failure: self.handleErrors)
        
    }
    
    func saveFinished() {
        
        if !isNew {
            _ = navigationController?.popViewController(animated: true)
            return
        }
        
        if isFirstCreate {
            UserDefaults.standard.set(false, forKey: "first_craete_wp")
            UserDefaults.standard.synchronize()
        }
        
        var controllers = navigationController?.viewControllers
        if isAddMode {
            let controller = JobEditController.instantiate()
            controller.location = location
            controllers?.insert(controller, at: (controllers?.count)!-1)
        } else {
            let controller = LocationDetailController.instantiate()
            controller.isFirstCreate = isFirstCreate
            controller.location = location
            controllers?.insert(controller, at: (controllers?.count)!-1)
        }
        navigationController?.viewControllers = controllers!
        _ = navigationController?.popViewController(animated: true)
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
        imgView.image = image
        removeImageButton.isHidden = false
        addLogoButton.setTitle("Change Logo", for: .normal)
    }
}
