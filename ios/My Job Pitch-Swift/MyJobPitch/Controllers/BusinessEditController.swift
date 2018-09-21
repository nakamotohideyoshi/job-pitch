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
    
    var logoPicker: ImagePicker!
    var logoImage: UIImage!
    
    var isFirstCreate = false
    var isNew = false
    
    var business: Business!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        logoPicker = ImagePicker()
        logoPicker.delegate = self
        
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
        AppHelper.loadLogo(business, imageView: imgView) {
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
        logoPicker.present(self, target: sender as! UIView)
    }
    
    @IBAction func removeImageAction(_ sender: Any) {
        
        logoImage = nil
        AppHelper.removeLoading(imageView: imgView)
        imgView.image = UIImage(named: "default-logo")
        removeImageButton.isHidden = true
        addLogoButton.setTitle("Add Logo", for: .normal)
    }
    
    @IBAction func saveAction(_ sender: Any) {
        
        if !valid() {
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
                
                self.showLoading(label: "Uploading...")
                
                API.shared().uploadImage(image: self.logoImage,
                                         endpoint: "user-business-images",
                                         objectKey: "business",
                                         objectId: self.business.id,
                                         order: 0,
                                         progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                            self.showLoading(label: "Uploading...", withProgress: Float(totalBytesWritten) / Float(totalBytesExpectedToWrite))
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
        let controller = BusinessDetailController.instantiate()
        controller.isFirstCreate = isFirstCreate
        controller.businessId = business.id
        controllers?.insert(controller, at: (controllers?.count)!-1)
        navigationController?.viewControllers = controllers!
        _ = navigationController?.popViewController(animated: true)
    }
    
    static func instantiate() -> BusinessEditController {
        return AppHelper.instantiate("BusinessEdit") as! BusinessEditController
    }

}

extension BusinessEditController: ImagePickerDelegate {
    
    func imageSelected(_ picker: ImagePicker, image: UIImage) {
        imgView.image = image
        removeImageButton.isHidden = false
        addLogoButton.setTitle("Change Logo", for: .normal)
    }
}

