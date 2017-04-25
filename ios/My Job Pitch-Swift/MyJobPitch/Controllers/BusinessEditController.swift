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
    @IBOutlet weak var addLogoButton: UIButton!
    @IBOutlet weak var removeImageButton: UIButton!
    @IBOutlet weak var creditsLabel: UILabel!
    
    var business: Business!
    
    var imagePicker: UIImagePickerController!    
    var logoImage: UIImage!
    
    var businessCount = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        imagePicker = UIImagePickerController()
        imagePicker.delegate = self
        
        businessCount = AppData.user.businesses.count
        
        //imgView.addDotBorder(dotWidth: 4, color: UIColor.black)
        
        if business == nil {
            navigationItem.title = "Add Business"
            creditsLabel.text = AppData.initialTokens.tokens.stringValue
        } else {
            navigationItem.title = "Edit Business"
            
            AppHelper.showLoading("Loading...")
            API.shared().loadBusiness(id: business.id, success: { (data) in
                AppHelper.hideLoading()
                self.business = data as! Business
                self.load()
            }, failure: self.handleErrors)
        }
        
    }
    
    func load() {        
        nameField.text = business.name
        creditsLabel.text = String(format: "%@", business.tokens)
        if let image = business.getImage() {
            AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
//            imgView.alpha = 1
            removeImageButton.isHidden = false
            addLogoButton.setTitle("Change Logo", for: .normal)
        }
    }
    
    override func getRequiredFields() -> [String: NSArray] {
        return [
            "business_name":    [nameField,    nameErrorLabel]
        ]
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
        imgView.image = UIImage(named: "default-logo")
//        imgView.alpha = 0.2
        removeImageButton.isHidden = true
        addLogoButton.setTitle("Add Logo", for: .normal)
    }
    
    @IBAction func saveAction(_ sender: Any) {
        
        if !valid() {
            return
        }
    
        AppHelper.showLoading("Saving...")
        
        if business == nil {
            business = Business()
        }
        
        business.name = nameField.text?.trimmingCharacters(in: .whitespacesAndNewlines)
    
        API.shared().saveBusiness(business: business, success: { (data) in
            
            let origImageID = self.business.getImage()?.id
            
            if self.logoImage != nil {
                
                let hud = AppHelper.createLoading()
                hud.mode = .determinateHorizontalBar
                hud.label.text = "Uploading..."
                
                API.shared().uploadImage(image: self.logoImage,
                                         endpoint: "user-business-images",
                                         objectKey: "business",
                                         objectId: self.business.id,
                                         order: 0,
                                         progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                            hud.progress = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
                }, success: { (data) in
                    self.saveFinished()
                }, failure: self.handleErrors)
                
            } else if origImageID != nil && self.removeImageButton.isHidden {
                
                API.shared().deleteImage(id: origImageID!, endpoint: "user-business-images", success: {
                    self.saveFinished()
                }, failure: self.handleErrors)
                
            } else {
                self.saveFinished()
            }
            
        }, failure: self.handleErrors)
        
    }
    
    func saveFinished() {
        
        if businessCount == 0 {
            BusinessListController.firstCreate = true
            UserDefaults.standard.set(true, forKey: "first_craete_wp")
        }
        
        AppHelper.hideLoading()
        _ = navigationController?.popViewController(animated: true)
    }
    
    static func pushController(business: Business!) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "BusinessEdit") as! BusinessEditController
        controller.business = business
        AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
    }

}

extension BusinessEditController: UIImagePickerControllerDelegate {
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        
        logoImage = info[UIImagePickerControllerOriginalImage] as? UIImage
        
        imgView.image = logoImage
//        imgView.alpha = 1
        removeImageButton.isHidden = false
        addLogoButton.setTitle("Change Logo", for: .normal)
        
        dismiss(animated: true, completion: nil)
        
    }
    
}

extension BusinessEditController: UINavigationControllerDelegate {
}

extension BusinessEditController: DropboxBrowserDelegate {
    
    func dropboxBrowser(_ browser: DropboxBrowserViewController!, didDownloadFile fileName: String!, didOverwriteFile isLocalFileOverwritten: Bool) {
        
        let url = URL(fileURLWithPath: browser.downloadedFilePath)
        do {
            let data = try Data(contentsOf: url)
            logoImage = UIImage(data: data)
            
            if logoImage == nil {
                //PopupController.showGray(fileName + "is not a image file", ok: "OK")
            } else {
                imgView.image = logoImage
//                imgView.alpha = 1
                removeImageButton.isHidden = false
                addLogoButton.setTitle("Change Logo", for: .normal)
            }
            
        } catch {
            print("error")
        }
        
        browser.removeDropboxBrowser()
    }
    
}

