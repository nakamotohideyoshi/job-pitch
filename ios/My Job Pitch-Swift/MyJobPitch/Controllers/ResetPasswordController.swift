//
//  ResetPasswordController.swift
//  MyJobPitch
//
//  Created by dev on 12/21/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

class ResetPasswordController: MJPController {

    @IBOutlet weak var emailField: UITextField!
    @IBOutlet weak var emailErrorLabel: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }
    
    override func getRequiredFields() -> [String: NSArray] {
        
        return [
            "email":        [emailField,    emailErrorLabel],
        ]
        
    }

    @IBAction func resetAction(_ sender: Any) {
        
        if valid() {
            
            AppHelper.showLoading("")
            
            API.shared().resetPassword(email: emailField.text!, success: { (_) in
                AppHelper.hideLoading()
                self.dismiss(animated: true, completion: nil)
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
        }
        
    }
    
    @IBAction func cancelAction(_ sender: Any) {
        dismiss(animated: true, completion: nil)
    }
    
}
