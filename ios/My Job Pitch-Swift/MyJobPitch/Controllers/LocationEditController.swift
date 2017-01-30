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
    @IBOutlet weak var addImageButton: UIButton!
    @IBOutlet weak var removeImageButton: UIButton!
    
    var business: Business!
    var location: Location!
    var savedLocation: (() -> Void)!
    
    var imagePicker: UIImagePickerController!
    var logoImage: UIImage!
    
    var latitude: NSNumber!
    var longitude: NSNumber!
    var placeID: String!
    var placeName: String!
    
    var origImage: Image!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        imagePicker = UIImagePickerController()
        imagePicker.delegate = self
        
        let iconView = UIImageView(image: UIImage(named: "location-icon"))
        iconView.contentMode = .scaleAspectFit
        iconView.frame = CGRect(x: 10, y: 7, width: 25, height: 26)
        locationButton.addSubview(iconView)
        
        if location != nil {
            
            navigationItem.title = "Edit Location"
            
            business = location.businessData
            
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
            
            if let image = location.getImage() {
                AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
                
                if location.images != nil && location.images.count > 0 {
                    origImage = image
                }
                
                addImageButton.isHidden = origImage != nil
                removeImageButton.isHidden = origImage == nil
            }
            
        } else {
            
            navigationItem.title = "Add Location"
            
            emailField.text = AppData.email
            
        }
        
        if removeImageButton.isHidden {
            
            if let image = business?.getImage() {
                AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
            } else {
                imgView.image = UIImage(named: "default-logo")
            }
            
            imgView.alpha = 0.2
            
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
    
    @IBAction func addImageAction(_ sender: Any) {
        
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
        
        let dropboxAction = UIAlertAction(title: "Dropbox", style: .default) { (_) in
            let browser = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "DropboxBrowser") as! DropboxBrowserViewController
            browser.rootViewDelegate = self
            let navController = UINavigationController(rootViewController: browser)
            AppHelper.getFrontController().present(navController, animated: true, completion: nil)
        }
        actionSheetContoller.addAction(dropboxAction)
        
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel, handler: nil)
        actionSheetContoller.addAction(cancelAction)
        
        present(actionSheetContoller, animated: true, completion: nil)
        
    }
    
    @IBAction func removeImageAction(_ sender: Any) {
        
        logoImage = nil
        if let image = business?.getImage() {
            AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        imgView.alpha = 0.2
        addImageButton.isHidden = false
        removeImageButton.isHidden = true
        
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
        
        if location == nil {
            location = Location()
            location.business = business?.id
        }
        
        location.name = nameField.text?.trimmingCharacters(in: .whitespacesAndNewlines)
        location.desc = descTextView.text?.trimmingCharacters(in: .whitespacesAndNewlines)
        location.email = emailField.text?.trimmingCharacters(in: .whitespacesAndNewlines)
        location.emailPublic = emailPublic.isOn
        location.telephone = ""
        location.telephonePublic = true
        location.mobile = phoneField.text;
        location.mobilePublic = phonePublic.isOn
        location.placeID = placeID
        location.placeName = placeName
        location.latitude = latitude
        location.longitude = longitude
        location.address = ""
        
        API.shared().saveLocation(location: location, success: { (data) in
            
            if self.origImage?.id != nil && self.removeImageButton.isHidden {
                
                API.shared().deleteImage(id: (self.origImage?.id)!, endpoint: "user-location-images", success: {
                    self.saveLogoImage()
                }) { (message, errors) in
                    self.handleErrors(message: message, errors: errors)
                }
                
            } else {
                self.saveLogoImage()
            }
            
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
        
    }
    
    func saveLogoImage() {
        
        if logoImage != nil {
            
            let hud = AppHelper.createLoading()
            hud.mode = .determinateHorizontalBar
            hud.label.text = "Uploading..."
            
            API.shared().uploadImage(image: logoImage,
                                     endpoint: "user-location-images",
                                     objectKey: "location",
                                     objectId: location.id,
                                     order: 0,
                                     progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                        hud.progress = Float(totalBytesWritten / totalBytesExpectedToWrite)
            }, success: { (data) in
                self.saveCompleted()
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
            
        } else {
            saveCompleted()
        }
        
    }
    
    func saveCompleted() {
        AppHelper.hideLoading()
        _ = navigationController?.popViewController(animated: true)
        savedLocation?()
    }
    
}

extension LocationEditController: UIImagePickerControllerDelegate {
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        
        logoImage = info[UIImagePickerControllerOriginalImage] as? UIImage
        
        imgView.image = logoImage
        imgView.alpha = 1
        removeImageButton.isHidden = false
        addImageButton.isHidden = true
        
        dismiss(animated: true, completion: nil)
        
    }
    
}

extension LocationEditController: UINavigationControllerDelegate {
}

extension LocationEditController: DropboxBrowserDelegate {
    
    func dropboxBrowser(_ browser: DropboxBrowserViewController!, didDownloadFile fileName: String!, didOverwriteFile isLocalFileOverwritten: Bool) {
        
        let url = URL(fileURLWithPath: browser.downloadedFilePath)
        do {
            let data = try Data(contentsOf: url)
            logoImage = UIImage(data: data)
            
            if logoImage == nil {
                //PopupController.showGray(fileName + "is not a image file", ok: "OK")
            } else {
                imgView.image = logoImage
                imgView.alpha = 1
                removeImageButton.isHidden = false
                addImageButton.isHidden = true
            }
            
        } catch {
            print("error")
        }
        
        browser.removeDropboxBrowser()
    }
    
}

