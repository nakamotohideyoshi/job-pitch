//
//  LocationEditController.swift
//  MyJobPitch
//
//  Created by dev on 12/13/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

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
    
    var imagePicker: UIImagePickerController!
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
        
        // Do any additional setup after loading the view.
        
        imagePicker = UIImagePickerController()
        imagePicker.delegate = self
        
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
            
            AppHelper.loadLogo(image: location.getImage(), imageView: imgView, completion: { 
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
        
        let actionSheetContoller = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
        
        let takePhotoAction = UIAlertAction(title: "Take Photo", style: .default) { (_) in
            self.imagePicker.sourceType = .camera
            self.present(self.imagePicker, animated: true, completion: nil)
        }
        actionSheetContoller.addAction(takePhotoAction)
        
        let photoGalleryAction = UIAlertAction(title: "Select Photo", style: .default) { (_) in
            self.imagePicker.sourceType = .photoLibrary
            self.present(self.imagePicker, animated: true, completion: nil)
        }
        actionSheetContoller.addAction(photoGalleryAction)
        
        let googledriveAction = UIAlertAction(title: "Google Drive", style: .default) { (_) in
            let browser = AppHelper.instantiate("GoogleDrive") as! GoogleDriveController
            browser.mimeQuery = "mimeType = 'image/png' or mimeType = 'image/jpg'"
            browser.downloadCallback = { (path) in
                self.downloadedLogo(path: path)
            }
            let navController = UINavigationController(rootViewController: browser)
            AppHelper.getFrontController().present(navController, animated: true, completion: nil)
        }
        actionSheetContoller.addAction(googledriveAction)
        
        let dropboxAction = UIAlertAction(title: "Dropbox", style: .default) { (_) in
            let browser = AppHelper.instantiate("Dropbox") as! DropboxController
            browser.downloadCallback = { (path) in
                self.downloadedLogo(path: path)
            }
            let navController = UINavigationController(rootViewController: browser)
            AppHelper.getFrontController().present(navController, animated: true, completion: nil)
        }
        actionSheetContoller.addAction(dropboxAction)
        
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel, handler: nil)
        actionSheetContoller.addAction(cancelAction)
        
        if let popoverController = actionSheetContoller.popoverPresentationController {
            let sourceView = sender as! UIView
            popoverController.sourceView = sourceView
            popoverController.sourceRect = CGRect(x: sourceView.bounds.midX, y: 0, width: 0, height: 0)
            popoverController.permittedArrowDirections = .down
        }
        
        present(actionSheetContoller, animated: true, completion: nil)
        
    }
    
    func downloadedLogo(path: String) {
        let url = URL(fileURLWithPath: path)
        do {
            let data = try Data(contentsOf: url)
            logoImage = UIImage(data: data)
            
            if logoImage == nil {
                //PopupController.showGray(fileName + "is not a image file", ok: "OK")
            } else {
                imgView.image = logoImage
                removeImageButton.isHidden = false
                addLogoButton.setTitle("Change Logo", for: .normal)
            }
            
        } catch {
            print("error")
        }
    }
    
    @IBAction func removeImageAction(_ sender: Any) {
        
        logoImage = nil
        AppHelper.loadLogo(image: business?.getImage(), imageView: imgView, completion: nil)
        addLogoButton.setTitle("Add Logo", for: .normal)
        removeImageButton.isHidden = true        
    }
    
    @IBAction func myLocationAction(_ sender: Any) {
        
        MapController.showModal(latitude: latitude,
                                longitude: longitude,
                                radius: nil,
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
            let controller = AppHelper.instantiate("JobEdit") as! JobEditController
            controller.location = location
            controllers?.insert(controller, at: (controllers?.count)!-1)
        } else {
            let controller = AppHelper.instantiate("JobList") as! LocationDetailController
            controller.isFirstCreate = isFirstCreate
            controller.location = location
            controllers?.insert(controller, at: (controllers?.count)!-1)
        }
        navigationController?.viewControllers = controllers!
        _ = navigationController?.popViewController(animated: true)
    }
    
    static func pushController(business: Business!, location: Location!) {
        let controller = AppHelper.instantiate("LocationEdit") as! LocationEditController
        controller.business = business
        controller.location = location
        AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
    }
    
}

extension LocationEditController: UIImagePickerControllerDelegate {
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        
        logoImage = info[UIImagePickerControllerOriginalImage] as? UIImage
        
        imgView.image = logoImage
//        imgView.alpha = 1
        removeImageButton.isHidden = false
        addLogoButton.setTitle("Change Logo", for: .normal)
        
        dismiss(animated: true, completion: nil)
        
    }
    
}

extension LocationEditController: UINavigationControllerDelegate {
}

extension LocationEditController: UITextFieldDelegate {
    func textFieldShouldBeginEditing(_ textField: UITextField) -> Bool {
        if addressField == textField {
            myLocationAction(textField)
        }
        return false
    }
}

