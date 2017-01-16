//
//  LoginController.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

class LoginController: MJPController {

    @IBOutlet weak var emailField: UITextField!
    @IBOutlet weak var emailErrorLabel: UILabel!
    @IBOutlet weak var passwordField: UITextField!
    @IBOutlet weak var passwordErrorLabel: UILabel!
    @IBOutlet weak var rememberSwitch: UISwitch!
    
    @IBOutlet weak var loginButton: GreenButton!
    
    
    static var userType: Int {
        get {
            return UserDefaults.standard.integer(forKey: "usertype")
        }
        set(newUserType) {
            UserDefaults.standard.set(newUserType, forKey: "usertype")
            UserDefaults.standard.synchronize()
        }
    }
    
    var remember: Bool {
        get {
            return UserDefaults.standard.bool(forKey: "remember")
        }
        set(newRemember) {
            UserDefaults.standard.set(newRemember, forKey: "remember")
            UserDefaults.standard.synchronize()
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        navigationController?.navigationBar.isHidden = true
        
        emailField.text = AppData.email
        if loginButton != nil && remember {
            passwordField.text = AppData.password
            rememberSwitch.isOn = true
            
            if !API.shared().isLogin() {
                loginAction(UIButton())
            }
        }
        
        API.shared().clearToken()
        AppData.clearData()
        
    }
    
    override func getRequiredFields() -> [String: NSArray] {
        return [
            "email":        [emailField,    emailErrorLabel],
            "password":     [passwordField, passwordErrorLabel]
        ]
    }
    
    func loadData() {
        
        remember = rememberSwitch.isOn
        AppData.email = emailField.text
        AppData.password = passwordField.text
        
        AppHelper.showLoading("Loading...")
        
        API.shared().getUser(success: { (user) in
            
            AppData.user = user as! User
            
            AppData.loadData(success: {
                
                if AppData.user.isRecruiter() {
                    
                    SideMenuController.pushController(id: "find_talent")
                    
                } else if AppData.user.isJobSeeker() {
                    
                    AppData.loadJobSeeker(success: {
                        
                        if AppData.jobSeeker.profile != nil {
                            SideMenuController.pushController(id: "find_job")
                        } else {
                            SideMenuController.pushController(id: "job_profile")
                        }
                        
                    }) { (message, errors) in
                        self.handleErrors(message: message, errors: errors)
                    }
                    
                } else {
                    
                    switch LoginController.userType {
                    case 1:
                        SideMenuController.pushController(id: "user_profile")
                        
                    case 2:
                        SideMenuController.pushController(id: "businesses")
                        
                    default:
                        let popupController = PopupController.show(AppHelper.getFrontController(), message: "Choose User Type", ok: "Get a Job", okCallback: {
                            LoginController.userType = 1
                            SideMenuController.pushController(id: "user_profile")
                        }, cancel: "I Need Staff", cancelCallback: {
                            LoginController.userType = 2
                            SideMenuController.pushController(id: "businesses")
                        })
                        popupController.okButton.backgroundColor = AppData.yellowColor
                        popupController.cancelButton.backgroundColor = AppData.greenColor
                    }
                    
                }
                
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
            
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
        
    }

    @IBAction func loginAction(_ sender: Any) {
        
        if validate() {
            
            AppHelper.showLoading("Signing in...")
            
            API.shared().login(email: emailField.text!, password: passwordField.text!,
                               success: { (authToken) in
                                API.shared().setToken((authToken as! AuthToken).key)
                                self.loadData()
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
        }
        
    }

    @IBAction func registerAction(_ sender: Any) {

        if validate() {
            
            LoginController.userType = (sender as! UIButton).tag
            
            AppHelper.showLoading("Signing up...")
            
            API.shared().register(email: emailField.text!, password: passwordField.text!,
                                  success: { (authToken) in
                                    API.shared().setToken((authToken as! AuthToken).key)
                                    self.loadData()
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
        }
        
    }

    @IBAction func goSignupAction(_ sender: Any) {
        view.endEditing(true)
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Signup")
        navigationController?.pushViewController(controller, animated: true)
    }
    
    @IBAction func goSigninAction(_ sender: Any) {
        view.endEditing(true)
        _ = navigationController?.popViewController(animated: true)
    }
    
}
