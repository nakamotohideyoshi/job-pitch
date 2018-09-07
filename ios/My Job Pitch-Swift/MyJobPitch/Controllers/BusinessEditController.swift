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
    
    var imagePicker: UIImagePickerController!
    var logoImage: UIImage!
    
    var isFirstCreate = false
    var isNew = false
    
    var business: Business!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        imagePicker = UIImagePickerController()
        imagePicker.delegate = self
        
        isFirstCreate = AppData.user.businesses.count == 0
        
        //imgView.addDotBorder(dotWidth: 4, color: UIColor.black)
        
        if business == nil {
            navigationItem.title = "Add Business"
            isNew = true
            creditsLabel.text = AppData.initialTokens.tokens.stringValue + " free credits"
            imgView.image = UIImage(named: "default-logo")
        } else {
            navigationItem.title = "Edit Business"
            
            showLoading()
            API.shared().loadBusiness(id: business.id, success: { (data) in
                self.hideLoading()
                self.business = data as! Business
                self.load()
            }, failure: self.handleErrors)
        }
        
    }
    
    func load() {        
        nameField.text = business.name
        creditsLabel.text = String(format: "%@", business.tokens)
        AppHelper.loadLogo(image: business.getImage(), imageView: imgView) {
            self.removeImageButton.isHidden = false
            self.addLogoButton.setTitle("Change Logo", for: .normal)
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
        
        let googledriveAction = UIAlertAction(title: "Google Drive", style: .default) { (_) in
            let browser = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "GoogleDrive") as! GoogleDriveController
            browser.mimeQuery = "mimeType = 'image/png' or mimeType = 'image/jpg'"
            browser.downloadCallback = { (path) in
                self.downloadedLogo(path: path)
            }
            let navController = UINavigationController(rootViewController: browser)
            AppHelper.getFrontController().present(navController, animated: true, completion: nil)
        }
        actionSheetContoller.addAction(googledriveAction)
        
        let dropboxAction = UIAlertAction(title: "Dropbox", style: .default) { (_) in
            let browser = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Dropbox") as! DropboxController
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
        AppHelper.removeLoading(imageView: imgView)
        imgView.image = UIImage(named: "default-logo")
        removeImageButton.isHidden = true
        addLogoButton.setTitle("Add Logo", for: .normal)
    }
    
    @IBAction func saveAction(_ sender: Any) {
        
        if loadingView != nil || !valid() {
            return
        }
    
        showLoading()
        
        if business == nil {
            business = Business()
        }
        
        business.name = nameField.text?.trimmingCharacters(in: .whitespacesAndNewlines)
    
        API.shared().saveBusiness(business: business, success: { (data) in
            
            let origImageID = self.business.getImage()?.id
            
            if self.logoImage != nil {
                
                self.loadingView.showProgressBar("Uploading...")
                
                API.shared().uploadImage(image: self.logoImage,
                                         endpoint: "user-business-images",
                                         objectKey: "business",
                                         objectId: self.business.id,
                                         order: 0,
                                         progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                            self.loadingView.progressView.progress = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
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
        
        if !isNew {
            _ = navigationController?.popViewController(animated: true)
            return
        }
        
        if isFirstCreate {
            UserDefaults.standard.set(true, forKey: "first_craete_wp")
            UserDefaults.standard.synchronize()
        }
        
        var controllers = navigationController?.viewControllers
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "LocationList") as! BusinessDetailController
        controller.isFirstCreate = isFirstCreate
        controller.businessId = business.id
        controllers?.insert(controller, at: (controllers?.count)!-1)
        navigationController?.viewControllers = controllers!
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
        removeImageButton.isHidden = false
        addLogoButton.setTitle("Change Logo", for: .normal)
        
        dismiss(animated: true, completion: nil)
        
    }
    
}

extension BusinessEditController: UINavigationControllerDelegate {
}

