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
    
    @IBOutlet weak var apiButton: UIButton!
    
    static var userType: Int {
        get {
            return UserDefaults.standard.integer(forKey: AppData.email)
        }
        set(newUserType) {
            UserDefaults.standard.set(newUserType, forKey: AppData.email)
            UserDefaults.standard.synchronize()
        }
    }
    
    var remember: Bool {
        get {
            return UserDefaults.standard.bool(forKey: "remember")
        }
        set(newRemember) {
            UserDefaults.standard.set(newRemember, forKey: "remember")
            if newRemember {
                UserDefaults.standard.set(API.shared().getToken(), forKey: "token")
            } else {
                UserDefaults.standard.removeObject(forKey: "token")
            }
            UserDefaults.standard.synchronize()
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        navigationController?.navigationBar.isHidden = true
        
        if (AppData.production) {
            apiButton.removeFromSuperview()
        } else {
            if let url = UserDefaults.standard.string(forKey: "api") {
                if API.instance == nil {
                    API.apiRoot = URL(string: url)!
                }
                apiButton.setTitle(url, for: .normal)
            }
        }
        
        if loginButton != nil {
            if !API.shared().isLogin() {
                // Check API deprecation
                checkDeprecation()
            } else {
                isLogin()
            }
        }
    }
    
    func isLogin() {
        emailField.text = AppData.email
        if remember {
            rememberSwitch.isOn = true
            
            if !API.shared().isLogin() {
                let token = UserDefaults.standard.string(forKey: "token")
                if token != nil {
                    API.shared().setToken(token!)
                    loadData()
                    return
                }
            }
        }
        
        API.shared().clearToken()
        AppData.clearData()
    }
    
    func checkDeprecation(){
     
        // Call Deprecation API
        showLoading()
        API.shared().loadDepreactions() { (result, error) in
            if error != nil {
                self.handleError(error)
                return
            }
            
            self.hideLoading()
            
            if result!.count == 0 {
                self.isLogin()
                return
            }
            
            // App version
            if let version = Bundle.main.infoDictionary?["CFBundleVersion"] as? String {
                let deprecation = ((result as! [Deprecation]).filter {$0.platform == "IOS"})[0]
                if  Int(version)! <= Int(deprecation.error)! {
                    self.showDeprecationError()
                } else if Int(version)! <= Int(deprecation.warning)! {
                    self.showDeprecationWarning()
                } else {
                    self.isLogin()
                }
            }
        }
    }
    
    func showDeprecationError() {
        PopupController.showGreen("Your app is out of date, you must upgrade to continue", ok: "Update", okCallback: {
            let url = URL(string: "https://itunes.apple.com/us/app/myjobpitch-job-matching/id1124296674?ls=1&amp;mt=8")
            if #available(iOS 10.0, *) {
                UIApplication.shared.open(url!, options: [:], completionHandler: { (_) in
                    exit(0)
                })
            } else {
                UIApplication.shared.openURL(url!)
            }
        }, cancel: "Close app", cancelCallback: {
            exit(0)
        })
    }
    
    func showDeprecationWarning() {
        PopupController.showGreen("Your app is out of date, update now to take advantage of the latest features", ok: "Update", okCallback: {
            let url = URL(string: "https://itunes.apple.com/us/app/myjobpitch-job-matching/id1124296674?ls=1&amp;mt=8")
            if #available(iOS 10.0, *) {
                UIApplication.shared.open(url!, options: [:], completionHandler: nil)
            } else {
                UIApplication.shared.openURL(url!)
            }
        }, cancel: "Dismiss", cancelCallback: {
            self.isLogin()
        })
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
        
        remember = rememberSwitch.isOn
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
                    
                } else if AppData.user.isJobSeeker() {
                    
                    if (AppData.jobSeeker.profile == nil) {
                        SideMenuController.pushController(id: "job_profile")
                    } else {
                        SideMenuController.pushController(id: "find_job")
                    }

                } else {
                    
                    let popupController = PopupController.show(AppHelper.getFrontController(), message: "Choose User Type", ok: "Get a Job", okCallback: {
                        LoginController.userType = 1
                        AppData.userRole = Role.ROLE_JOB_SEEKER_ID
                        self.showIntro()
                    }, cancel: "I Need Staff", cancelCallback: {
                        LoginController.userType = 2
                        AppData.userRole = Role.ROLE_RECRUITER_ID
                        SideMenuController.pushController(id: "businesses")
                    })
                    popupController.okButton.backgroundColor = AppData.yellowColor
                    popupController.cancelButton.backgroundColor = AppData.greenColor
                }
            }
        }
    }
    
    func showIntro() {
        let controller = AppHelper.instantiate("Intro")
        navigationController?.pushViewController(controller, animated: true)
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
        let actionSheet = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
        
        let api1Action = UIAlertAction(title: "app.myjobpitch.com", style: .default) { (_) in
            self.setApiUrl("https://app.myjobpitch.com")
        }
        actionSheet.addAction(api1Action)
        
        let api2Action = UIAlertAction(title: "test.sclabs.co.uk", style: .default) { (_) in
            self.setApiUrl("https://test.sclabs.co.uk")
        }
        actionSheet.addAction(api2Action)
        
        let api3Action = UIAlertAction(title: "demo.sclabs.co.uk", style: .default) { (_) in
            self.setApiUrl("https://demo.sclabs.co.uk")
        }
        actionSheet.addAction(api3Action)
        
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel, handler: nil)
        actionSheet.addAction(cancelAction)
        
        if let popoverController = actionSheet.popoverPresentationController {
            let sourceView = sender as! UIView
            popoverController.sourceView = sourceView
            popoverController.sourceRect = CGRect(x: sourceView.bounds.midX, y: 0, width: 0, height: 0)
            popoverController.permittedArrowDirections = .down
        }
        
        present(actionSheet, animated: true, completion: nil)
    }
    
    func setApiUrl(_ url: String) {
        API.instance = nil
        API.apiRoot = URL(string: url)!
        apiButton.setTitle(url, for: .normal)
        UserDefaults.standard.set(url, forKey: "api")
        UserDefaults.standard.synchronize()        
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

