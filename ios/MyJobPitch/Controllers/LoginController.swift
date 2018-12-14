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
    
    @IBOutlet weak var loginButton: GreenButton!
    
    @IBOutlet weak var apiButton: UIButton!
   
    override func viewDidLoad() {
        super.viewDidLoad()

        navigationController?.navigationBar.isHidden = true
        
        emailField.text = AppData.email
        
        if (AppData.production) {
            apiButton.removeFromSuperview()
        } else {
            if let url = UserDefaults.standard.string(forKey: "server") {
                if API.instance == nil {
                    API.apiRoot = URL(string: url)!
                }
                apiButton.setTitle(url, for: .normal)
            }
        }
        
        if API.instance == nil {
            checkDeprecation()
        } else {
            UserDefaults.standard.removeObject(forKey: "token")
            UserDefaults.standard.synchronize()
            API.shared().clearToken()
            AppData.clearData()
        }
    }
    
    func autoLogin() {
        let token = UserDefaults.standard.string(forKey: "token")
        if token != nil {
            API.shared().setToken(token!)
            loadData()
            return
        }
        
        API.shared().clearToken()
        AppData.clearData()
    }
    
    func checkDeprecation(){
        showLoading()
     
        API.shared().loadDepreactions() { (result, error) in
            if error != nil {
                self.handleError(error)
                return
            }
            
            self.hideLoading()
            
            if result!.count == 0 {
                self.autoLogin()
                return
            }
            
            // App version
            if let version = Bundle.main.infoDictionary?["CFBundleVersion"] as? String {
                let deprecation = ((result as! [Deprecation]).filter {$0.platform == "IOS"})[0]
                if  Int(version)! <= Int(deprecation.error)! {
                    
                    PopupController.showGreen(NSLocalizedString("Your app is out of date, you must upgrade to continue", comment: ""),
                                              ok: NSLocalizedString("Update", comment: ""), okCallback: {
                        let url = URL(string: "https://itunes.apple.com/us/app/myjobpitch-job-matching/id1124296674?ls=1&amp;mt=8")
                        if #available(iOS 10.0, *) {
                            UIApplication.shared.open(url!, options: [:], completionHandler: { (_) in
                                exit(0)
                            })
                        } else {
                            UIApplication.shared.openURL(url!)
                        }
                    }, cancel: NSLocalizedString("Close app", comment: ""), cancelCallback: {
                        exit(0)
                    })
                    
                } else if Int(version)! <= Int(deprecation.warning)! {
                    
                    PopupController.showGreen(NSLocalizedString("Your app is out of date, update now to take advantage of the latest features", comment: ""),
                                              ok: NSLocalizedString("Update", comment: ""), okCallback: {
                        let url = URL(string: "https://itunes.apple.com/us/app/myjobpitch-job-matching/id1124296674?ls=1&amp;mt=8")
                        if #available(iOS 10.0, *) {
                            UIApplication.shared.open(url!, options: [:], completionHandler: nil)
                        } else {
                            UIApplication.shared.openURL(url!)
                        }
                    }, cancel: NSLocalizedString("Dismiss", comment: ""), cancelCallback: {
                        self.autoLogin()
                    })
                    
                } else {
                    self.autoLogin()
                }
            }
        }
    }
    
    override func showLoading() {
        super.showLoading()
        loading.view.backgroundColor = AppData.darkColor
        loading.indicatorView.color = UIColor.white
    }
    
    override func getRequiredFields() -> [String: (UIView, UILabel)] {
        return [
            "email":        (emailField,    emailErrorLabel),
            "password":     (passwordField, passwordErrorLabel)
        ]
    }
    
    func loadData() {
        
        UserDefaults.standard.set(API.shared().getToken(), forKey: "token")
        UserDefaults.standard.synchronize()
        
        AppData.email = emailField.text
        
        showLoading()
        
        API.shared().getUser() { (result, error) in
            if error != nil {
                self.handleError(error)
                return
            }
            
            AppData.user = result as! User
            
            AppData.loadData() { error in
                
                if error != nil {
                    self.handleError(error)
                    return
                }
                
                if AppData.user.isRecruiter() {
                    
                    SideMenuController.pushController(id: "find_talent")
                    
                } else if AppData.user.isJobseeker() {
                    
                    if (AppData.jobseeker.profile == nil) {
                        SideMenuController.pushController(id: "job_profile")
                    } else {
                        SideMenuController.pushController(id: "find_job")
                    }

                } else {
                    
                    let popupController = PopupController.show(AppHelper.getFrontController(), message: NSLocalizedString("Choose User Type", comment: ""),
                                                               ok: NSLocalizedString("Get a Job", comment: ""), okCallback: {
                        AppData.userRole = Role.ROLE_JOB_SEEKER_ID
                        let controller = AppHelper.instantiate("Intro")
                        self.navigationController?.pushViewController(controller, animated: true)
                    }, cancel: NSLocalizedString("I Need Staff", comment: ""), cancelCallback: {
                        AppData.userRole = Role.ROLE_RECRUITER_ID
                        SideMenuController.pushController(id: "businesses")
                    })
                    popupController.okButton.backgroundColor = AppData.yellowColor
                    popupController.cancelButton.backgroundColor = AppData.greenColor
                }
            }
        }
    }
    
    @IBAction func loginAction(_ sender: Any) {
        
        if valid() {
            
            showLoading()
            
            let request = LoginRequest()
            request.email = emailField.text!
            request.password = passwordField.text!
            
            API.shared().login(request) { (result, error) in
                if result != nil {
                    API.shared().setToken((result as! AuthToken).key)
                    self.loadData()
                } else {
                    self.handleError(error)
                }
            }
        }
    }

    @IBAction func registerAction(_ sender: Any) {
        
        if valid() {
            
            showLoading()
            
            AppData.email = emailField.text
            
            let request = RegisterRequest()
            request.email = emailField.text!
            request.password1 = passwordField.text!
            request.password2 = passwordField.text!
            
            API.shared().register(request) { (result, error) in
                if result != nil {
                    API.shared().setToken((result as! AuthToken).key)
                    self.loadData()
                } else {
                    self.handleError(error)
                }
            }
        }
    }

    @IBAction func goSignupAction(_ sender: Any) {
        view.endEditing(true)
        let controller = AppHelper.instantiate("Signup")
        navigationController?.pushViewController(controller, animated: true)
    }
    
    @IBAction func goSigninAction(_ sender: Any) {
        view.endEditing(true)
        _ = navigationController?.popViewController(animated: true)
    }
   
    @IBAction func selectAPIAction(_ sender: Any) {
        let setServerUrl = { (action: UIAlertAction) in
            let url = action.title
            API.instance = nil
            API.apiRoot = URL(string: url!)!
            self.apiButton.setTitle(url, for: .normal)
            UserDefaults.standard.set(url, forKey: "server")
            UserDefaults.standard.synchronize()
        }

        let actionSheet = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
        
        let api1Action = UIAlertAction(title: "https://app.myjobpitch.com", style: .default, handler: setServerUrl)
        actionSheet.addAction(api1Action)
        
        let api2Action = UIAlertAction(title: "https://test.sclabs.co.uk", style: .default, handler: setServerUrl)
        actionSheet.addAction(api2Action)
        
        let api3Action = UIAlertAction(title: "https://demo.sclabs.co.uk", style: .default, handler: setServerUrl)
        actionSheet.addAction(api3Action)
        
        let api4Action = UIAlertAction(title: "https://release.sclabs.co.uk", style: .default, handler: setServerUrl)
        actionSheet.addAction(api4Action)
        
        let cancelAction = UIAlertAction(title: NSLocalizedString("Cancel", comment: ""), style: .cancel, handler: nil)
        actionSheet.addAction(cancelAction)
        
        present(actionSheet, animated: true, completion: nil)
    }
}

extension LoginController: UITextFieldDelegate {
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        if textField == emailField {
            passwordField.becomeFirstResponder()
            return false
        }
        if textField == passwordField {
            if loginButton != nil {
                loginAction(UIButton())
            } else {
                registerAction(UIButton())
            }
            return false
        }
        return true
    }
}

