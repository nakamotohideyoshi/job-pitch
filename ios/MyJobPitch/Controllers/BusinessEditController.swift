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
    
    override func getRequiredFields() -> [String: (UIView, UILabel)] {
        return [
            "name":    (nameField, nameErrorLabel)
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
    
        API.shared().saveBusiness(business) { (result, error) in
            
            if error != nil {
                self.handleError(error)
                return
            }
            
            self.business = result as! Business
            
            if self.logoImage != nil {
                
                self.showLoading("Uploading...")
                
                API.shared().uploadImage(self.logoImage,
                                         endpoint: "user-business-images",
                                         objectKey: "business",
                                         objectId: self.business.id,
                                         order: 0,
                                         progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                            self.showLoading("Uploading...", withProgress: Float(totalBytesWritten) / Float(totalBytesExpectedToWrite))
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
        
        AppData.updateBusiness(business.id) { (result, error) in
            
            if error != nil {
                self.handleError(error)
                return
            }
            
            if self.isNew && AppData.businesses.count == 1 {
                UserDefaults.standard.set(1, forKey: "tutorial")
                UserDefaults.standard.synchronize()
                AppData.startTimer()
            }
            
            self.closeController()
            self.saveComplete?(result!)            
        }
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

