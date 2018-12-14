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
    @IBOutlet weak var countryField: UITextField!
    @IBOutlet weak var countryError: UILabel!
    @IBOutlet weak var regionField: UITextField!
    @IBOutlet weak var regionError: UILabel!
    @IBOutlet weak var cityField: UITextField!
    @IBOutlet weak var cityError: UILabel!
    @IBOutlet weak var streetField: UITextField!
    @IBOutlet weak var streetError: UILabel!
    @IBOutlet weak var postcodeField: UITextField!
    @IBOutlet weak var postcodeError: UILabel!
    @IBOutlet weak var locationButton: YellowButton!
    @IBOutlet weak var logoView: UIImageView!
    
    public var business: Business!
    public var workplace: Location!
    public var saveComplete: ((Location) -> Void)?
    
    var logoPicker: ImagePicker!
    var logoImage: UIImage!
    
    var latitude: NSNumber!
    var longitude: NSNumber!
    var placeName: String!
    
    var addMode = false
    var isNew = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        isModal = true
        
        logoPicker = ImagePicker()
        logoPicker.delegate = self
        
        addMode = SideMenuController.currentID != "businesses"
        
        if workplace == nil {
            isNew = true
            
            title = NSLocalizedString("Add Workplace", comment: "")
            logoView.image = UIImage(named: "default-logo")
            emailField.text = AppData.email
            
        } else {
            
            title = NSLocalizedString("Edit Workplace", comment: "")
            business = workplace.businessData
            AppHelper.loadLogo(workplace, imageView: logoView, completion: nil)
            nameField.text = workplace.name
            descTextView.text = workplace.desc
            emailField.text = workplace.email
            emailPublic.isOn = workplace.emailPublic
            phoneField.text = workplace.mobile
            phonePublic.isOn = workplace.mobilePublic
            placeName = workplace.placeName
            countryField.text = workplace.country
            regionField.text = workplace.region
            cityField.text = workplace.city
            streetField.text = workplace.street
            postcodeField.text = workplace.postcode
            latitude = workplace.latitude
            longitude = workplace.longitude
            
        }
        
        let iconView = UIImageView(image: UIImage(named: "location-icon"))
        iconView.contentMode = .scaleAspectFit
        iconView.frame = CGRect(x: 10, y: 7, width: 25, height: 26)
        locationButton.addSubview(iconView)
    }
    
    override func getRequiredFields() -> [String: (UIView, UILabel)] {
        return [
            "name":         (nameField,    nameErrorLabel),
            "description":  (descTextView, descError),
            "email":        (emailField,   emailError),
            "street":       (streetField, streetError),
            "city":         (cityField, cityError),
            "region":       (regionField, regionError),
            "postcode":       (postcodeField, postcodeError),
            "country":       (countryField, countryError)
        ]
    }
    
    @IBAction func emailHelp(_ sender: Any) {
        PopupController.showGray(NSLocalizedString("The is the email that notifications will be sent to, it can be different to your login email address.", comment: ""),
                                 ok: NSLocalizedString("Close", comment: ""))
    }
    
    @IBAction func addressHelpAction(_ sender: Any) {
        PopupController.showGray(NSLocalizedString("Search for a place name, street, postcode, etc. or click the map to select location.", comment: ""),
                                 ok: NSLocalizedString("Close", comment: ""))
    }
    
    @IBAction func addLogoAction(_ sender: Any) {
        logoPicker.present(self, target: sender as! UIView)
    }
    
    @IBAction func myLocationAction(_ sender: Any) {
        
        let controller = MapController.instantiate()
        if latitude != nil {
            controller.currentPos = CLLocationCoordinate2DMake(latitude as! CLLocationDegrees, longitude as! CLLocationDegrees)
        }
        controller.complete = { (locationCoordinate, country, region, city, street, postcode, address) in
            self.latitude = locationCoordinate.latitude as NSNumber!
            self.longitude = locationCoordinate.longitude as NSNumber!
            self.countryField.text = country
            self.regionField.text = region
            self.cityField.text = city
            self.streetField.text = street
            self.postcodeField.text = postcode
            self.placeName = address
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
        workplace.latitude = latitude
        workplace.longitude = longitude
        workplace.placeID = ""
        workplace.placeName = placeName        
        workplace.country = (countryField.text?.isEmpty)! ? "" : countryField.text
        workplace.region = (regionField.text?.isEmpty)! ? "" : regionField.text
        workplace.city = cityField.text
        workplace.street = streetField.text
        workplace.streetNumber = streetField.text
        workplace.postcode = (postcodeField.text?.isEmpty)! ? "" : postcodeField.text
        
        API.shared().saveLocation(workplace) { (result, error) in
            
            if error != nil {
                self.handleError(error)
                return
            }
            
            self.workplace = result as! Location
            
            if self.logoImage != nil {
                
                self.showLoading(NSLocalizedString("Uploading...", comment: ""))
                
                API.shared().uploadImage(self.logoImage,
                                         endpoint: "user-location-images",
                                         objectKey: "location",
                                         objectId: self.workplace.id,
                                         order: 0,
                                         progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                            self.showLoading("", withProgress: Float(totalBytesWritten) / Float(totalBytesExpectedToWrite))
                 }) { (_, error) in
                    if error == nil {
                        self.saveFinished()
                    } else {
                        self.handleError(error)
                    }
                }
            } else {
                self.saveFinished()
            }
        }        
    }
    
    func saveFinished() {
        
        AppData.updateWorkplace(workplace.id) { (result, error) in
            
            if error != nil {
                self.handleError(error)
                return
            }
            
            if self.isNew && UserDefaults.standard.integer(forKey: "tutorial") == 1 {
                UserDefaults.standard.set(2, forKey: "tutorial")
                UserDefaults.standard.synchronize()
            }
            
            self.closeController()
            self.saveComplete?(result!)
        }
    }
    
    static func instantiate() -> LocationEditController {
        return AppHelper.instantiate("LocationEdit") as! LocationEditController
    }
    
}

extension LocationEditController: ImagePickerDelegate {
    
    func imageSelected(_ picker: ImagePicker, image: UIImage) {
        logoImage = image
        logoView.image = image
    }
}
