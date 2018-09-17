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
    
    override func showLoading() {
        super.showLoading()
        loadingView.backgroundColor = UIColor(red: 65.8/255.0, green:65.8/255.0, blue: 65.8/255.0, alpha: 1)
        loadingView.indicatorView.color = UIColor.white
    }

    @IBAction func resetAction(_ sender: Any) {
        
        if valid() {
            
            showLoading()
            
            API.shared().resetPassword(email: emailField.text!, success: { (_) in
                self.hideLoading()
                let _ = PopupController.show(AppHelper.getFrontController(), message: "Password reset requested, please check your email.", ok: nil, okCallback: nil, cancel: "OK", cancelCallback: {
                    self.dismiss(animated: true, completion: nil)
                })
            }, failure: self.handleErrors)
        }
        
    }
    
    @IBAction func cancelAction(_ sender: Any) {
        dismiss(animated: true, completion: nil)
    }
    
}
