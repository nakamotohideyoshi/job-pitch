//
//  ChangePasswordController.swift
//  MyJobPitch
//
//  Created by dev on 12/27/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

class ChangePasswordController: MJPController {

    
    @IBOutlet weak var emailLabel: UILabel!
    @IBOutlet weak var currentPassword: UITextField!
    @IBOutlet weak var currentPassError: UILabel!
    @IBOutlet weak var password1: UITextField!
    @IBOutlet weak var pass1Error: UILabel!
    @IBOutlet weak var password2: UITextField!
    @IBOutlet weak var pass2Error: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        emailLabel.text = AppData.email
                
    }

    override func getRequiredFields() -> [String: NSArray] {
        return [
            "old_password": [currentPassword, currentPassError],
            "password1":[password1, pass1Error],
            "password2":[password2, pass2Error]
        ]
    }
    
    @IBAction func changeAction(_ sender: Any) {
        
        if validate() {
            
            let password = AppData.password
            if password != currentPassword.text {
                currentPassError.text = "your old password was incorrect."
                return
            }
        
            AppHelper.showLoading("Updating...")
            
            API.shared().changePassword(password1: password1.text!,
                                        password2: password2.text!,
                                        success: { (_) in
                                            AppData.password = self.password1.text
                                            PopupController.showGreen("Success!", ok: "OK", okCallback: nil, cancel: nil, cancelCallback: nil)
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
            
        }
        
    }

}
