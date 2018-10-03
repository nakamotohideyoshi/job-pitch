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
    @IBOutlet weak var logoView: UIImageView!
    @IBOutlet weak var creditsLabel: UILabel!

    public var business: Business!
    public var saveComplete: ((Business) -> Void)?
    
    var logoPicker: ImagePicker!
    var logoImage: UIImage!
    
    var isNew = false
    
    override func viewDidLoad() {
        super.viewDidLoad()

        isModal = true
        
        logoPicker = ImagePicker()
        logoPicker.delegate = self
        
        if business == nil {
            isNew = true
            title = "Add Business"
            logoView.image = UIImage(named: "default-logo")
            creditsLabel.text = AppData.initialTokens.tokens.stringValue + " free credits"
        } else {
            title = "Edit Business"
            AppHelper.loadLogo(business, imageView: logoView, completion: nil)
            nameField.text = business.name
            creditsLabel.text = String(format: "%@", business.tokens)
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
            
            self.business = data as! Business
            
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
                
            } else {
                self.saveFinished()
            }
            
        }, failure: handleErrors)
        
    }
    
    func saveFinished() {
        
        AppData.updateBusiness(business.id, success: { (business) in
            
            if self.isNew && AppData.businesses.count == 1 {
                UserDefaults.standard.set(1, forKey: "tutorial")
                UserDefaults.standard.synchronize()
            }
            
            self.closeController()
            self.saveComplete?(self.business)
            
        }, failure: handleErrors)
    }
    
    static func instantiate() -> BusinessEditController {
        return AppHelper.instantiate("BusinessEdit") as! BusinessEditController
    }
}

extension BusinessEditController: ImagePickerDelegate {
    
    func imageSelected(_ picker: ImagePicker, image: UIImage) {
        logoImage = image
        logoView.image = image
    }
}

