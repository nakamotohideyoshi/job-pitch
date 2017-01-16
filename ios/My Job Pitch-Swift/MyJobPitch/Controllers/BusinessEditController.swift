//
//  BusinessEditController.swift
//  MyJobPitch
//
//  Created by dev on 12/13/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

class BusinessEditController: MJPController {

    @IBOutlet weak var nameField: UITextField!
    @IBOutlet weak var nameErrorLabel: UILabel!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var addImageButton: UIButton!
    @IBOutlet weak var removeImageButton: UIButton!
    
    var business: Business!
    var savedBusiness: (() -> Void)!
    
    var imagePicker: UIImagePickerController!    
    var logoImage: UIImage!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        imagePicker = UIImagePickerController()
        imagePicker.delegate = self
        
        if business != nil {
        
            navigationItem.title = "Edit Business"
            
            nameField.text = business.name
            
            if let image = business.getImage() {
                AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
                addImageButton.isHidden = true
                removeImageButton.isHidden = false
            }
            
        } else {
            
            navigationItem.title = "Add Business"
            
        }
        
        if removeImageButton.isHidden {
            
            imgView.image = UIImage(named: "default-logo")
            imgView.alpha = 0.2
            
        }
        
    }
    
    override func getRequiredFields() -> [String: NSArray] {
        return [
            "business_name":    [nameField,    nameErrorLabel]
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
        
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel, handler: nil)
        actionSheetContoller.addAction(cancelAction)
        
        present(actionSheetContoller, animated: true, completion: nil)
        
    }
    
    @IBAction func removeImageAction(_ sender: Any) {
        
        logoImage = nil
        imgView.image = UIImage(named: "default-logo")
        imgView.alpha = 0.2
        addImageButton.isHidden = false
        removeImageButton.isHidden = true
        
    }
    
    @IBAction func saveAction(_ sender: Any) {
        
        if !validate() {
            return
        }
    
        AppHelper.showLoading("Saving...")
        
        if business == nil {
            business = Business()
        }
        
        business.name = nameField.text?.trimmingCharacters(in: .whitespacesAndNewlines)
    
        API.shared().saveBusiness(business: business, success: { (data) in
            
            let origImageID = self.business.getImage()?.id
            if origImageID != nil && self.removeImageButton.isHidden {
                
                API.shared().deleteImage(id: origImageID!, endpoint: "user-business-images", success: {
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
                                     endpoint: "user-business-images",
                                     objectKey: "business",
                                     objectId: business.id,
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
        savedBusiness?()
    }

}

extension BusinessEditController: UIImagePickerControllerDelegate {
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        
        logoImage = info[UIImagePickerControllerOriginalImage] as? UIImage
        
        imgView.image = logoImage
        imgView.alpha = 1
        removeImageButton.isHidden = false
        addImageButton.isHidden = true
        
        dismiss(animated: true, completion: nil)
        
    }
    
}

extension BusinessEditController: UINavigationControllerDelegate {
}
