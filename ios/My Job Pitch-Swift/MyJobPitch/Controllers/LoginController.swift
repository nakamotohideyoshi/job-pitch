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

        // Do any additional setup after loading the view.
        
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
        // Check API deprecation
        checkDeprecation()
    }
    
    func isLogin() {
        emailField.text = AppData.email
        if loginButton != nil && remember {
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
        API.shared().loadDepreactions(success: { (data) in
            self.hideLoading()
            
            if data.count == 0 {
                self.isLogin()
                return
            }
            
            // App version
            if let version = Bundle.main.infoDictionary?["CFBundleVersion"] as? String {
                let deprecation = ((data as! [Deprecation]).filter {$0.platform == "IOS"})[0]
                if  Int(version)! <= Int(deprecation.error)! {
                    self.showDeprecationError()
                } else if Int(version)! <= Int(deprecation.warning)! {
                    self.showDeprecationWarning()
                } else {
                    self.isLogin()
                }
            }
           
        }, failure: self.handleErrors)
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
        loadingView.backgroundColor = UIColor(red: 65.8/256.0, green:65.8/256.0, blue: 65.8/256.0, alpha: 1)
        loadingView.indicatorView.color = UIColor.white
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
        
        showLoading()
        
        API.shared().getUser(success: { (data) in
            AppData.user = data as! User
            
            AppData.loadData(success: {
                
                if AppData.user.isRecruiter() {
                    
                    SideMenuController.pushController(id: "find_talent")
                    
                } else if AppData.user.isJobSeeker() {
                    
                    API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
                        let jobSeeker = data as! JobSeeker
                        AppData.existProfile = jobSeeker.profile != nil
                        if AppData.existProfile {
                            SideMenuController.pushController(id: "find_job")
                        } else {
                            SideMenuController.pushController(id: "job_profile")
                        }
                    }, failure: self.handleErrors)

                } else {
                    
                    switch LoginController.userType {
                    case 1:
                        self.showIntro()
                        
                    case 2:
                        SideMenuController.pushController(id: "businesses")
                        
                    default:
                        let popupController = PopupController.show(AppHelper.getFrontController(), message: "Choose User Type", ok: "Get a Job", okCallback: {
                            LoginController.userType = 1
                            self.showIntro()
                        }, cancel: "I Need Staff", cancelCallback: {
                            LoginController.userType = 2
                            SideMenuController.pushController(id: "businesses")
                        })
                        popupController.okButton.backgroundColor = AppData.yellowColor
                        popupController.cancelButton.backgroundColor = AppData.greenColor
                    }
                    
                }
                
            }, failure: self.handleErrors)
            
        }, failure: self.handleErrors)
        
    }
    
    func showIntro() {
        let controller = AppHelper.instantiate("Intro")
        navigationController?.pushViewController(controller, animated: true)
    }
    
    @IBAction func loginAction(_ sender: Any) {
        
        if valid() {
            
            showLoading()
            
            API.shared().login(email: emailField.text!, password: passwordField.text!,
                               success: { (authToken) in
                                API.shared().setToken((authToken as! AuthToken).key)
                                self.loadData()
            }, failure: self.handleErrors)
        }
    }

    @IBAction func registerAction(_ sender: Any) {
        
        if valid() {
            
            showLoading()
            
            AppData.email = emailField.text
            LoginController.userType = (sender as! UIButton).tag
            
            API.shared().register(email: emailField.text!, password: passwordField.text!,
                                  success: { (authToken) in
                                    API.shared().setToken((authToken as! AuthToken).key)
                                    self.loadData()
            }, failure: self.handleErrors)
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
