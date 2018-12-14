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
    
    override func getRequiredFields() -> [String: (UIView, UILabel)] {
        return [
            "email":    (emailField, emailErrorLabel),
        ]
    }
    
    override func showLoading() {
        super.showLoading()
        loading.view.backgroundColor = UIColor(red: 65.8/255.0, green:65.8/255.0, blue: 65.8/255.0, alpha: 1)
        loading.indicatorView.color = UIColor.white
    }

    @IBAction func resetAction(_ sender: Any) {
        
        if valid() {
            
            showLoading()
            
            let request = PasswordResetRequest()
            request.email = emailField.text!
            
            API.shared().resetPassword(request) { (_, error) in
                if error == nil {
                    self.hideLoading()
                    let _ = PopupController.show(AppHelper.getFrontController(), message: NSLocalizedString("Password reset requested, please check your email.", comment: ""),
                                                 ok: nil, okCallback: nil, cancel: NSLocalizedString("Ok", comment: ""), cancelCallback: {
                        self.dismiss(animated: true, completion: nil)
                    })
                } else {
                    self.handleError(error)
                }
            }
        }        
    }
    
    @IBAction func cancelAction(_ sender: Any) {
        dismiss(animated: true, completion: nil)
    }
    
}
