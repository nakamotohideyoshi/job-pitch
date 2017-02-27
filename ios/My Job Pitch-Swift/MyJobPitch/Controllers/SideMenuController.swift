//
//  SideMenuController.swift
//  MyJobPitch
//
//  Created by dev on 1/9/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

class SideMenuController: UIViewController {
    
    static var currentID = ""
    static let menuItems = [
        "find_job":     ["icon": "menu-job-search",     "title": "Find Job",                "identifier": "Swipe",              "per": "P"],
        "applications": ["icon": "menu-application",    "title": "Applications",            "identifier": "ApplicationList",    "per": "PB"],
        "messages":     ["icon": "menu-message",        "title": "Messages",                "identifier": "MessageList",        "per": "PB"],
        "job_profile":  ["icon": "menu-job-profile",    "title": "Job Profile",             "identifier": "JobProfile",         "per": "J"],
        "add_record":   ["icon": "menu-add-record",     "title": "Record Pitch",            "identifier": "Pitch",              "per": "J"],
        "user_profile": ["icon": "menu-user-profile",   "title": "Profile",                 "identifier": "JobSeekerProfile",   "per": ""],
        
        "find_talent":  ["icon": "menu-user-search",    "title": "Find Talent",             "identifier": "SelectJob",          "per": "B"],
        "connections":  ["icon": "menu-connect",        "title": "Connections",             "identifier": "SelectJob",          "per": "B"],
        "shortlist":    ["icon": "menu-shortlist",      "title": "My Shortlist",            "identifier": "SelectJob",          "per": "B"],
        "businesses":   ["icon": "menu-business",       "title": "Add or Edit Jobs",        "identifier": "BusinessList",       "per": ""],
        "payment":      ["icon": "menu-payment",        "title": "Payment",                 "identifier": "",                   "per": ""],
        
        "change_pass":  ["icon": "menu-key",            "title": "Change Password",         "identifier": "ChangePassword",     "per": ""],
        "help":         ["icon": "menu-help",           "title": "Help",                    "identifier": "Help",               "per": ""],
        "contact_us":   ["icon": "menu-contact-us",     "title": "Contact Us",              "identifier": "ContactUs",          "per": ""],
        "log_out":      ["icon": "menu-logout",         "title": "Log Out",                 "identifier": "Signin",             "per": ""]
    ]
    
    static let jobSeekerMenu = [
        "find_job", "applications", "messages", "job_profile", "add_record", "user_profile", "change_pass", "help", "contact_us", "log_out"
    ]
    
    static let recruiterMenu = [
        "find_talent", "applications", "connections", "shortlist", "messages", "businesses", "change_pass", "help", "contact_us", "log_out"
    ]
    
    static func getCurrentTitle(_ id: String!) -> String! {
        return menuItems[id == nil ? currentID : id]?["title"]
    }
    
    
    @IBOutlet weak var tableView: UITableView!
    
    var maskButton: UIButton!
    
    var data = [String]()
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        revealViewController().view.endEditing(true)
        
        let frontController = revealViewController().frontViewController
        maskButton = UIButton()
        maskButton.frame = (frontController?.view.frame)!
        maskButton.addTarget(revealViewController(),
                             action: #selector(SWRevealViewController.revealToggle(_:)),
                             for: .touchUpInside)
        frontController?.view.addSubview(maskButton)
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        data = [String]()
        if let user = AppData.user {
            //if user.isJobSeeker() || (!user.isRecruiter() && LoginController.userType == 1)
            if user.isJobSeeker() {
                data = SideMenuController.jobSeekerMenu
            } else if user.isRecruiter() {
                data = SideMenuController.recruiterMenu
            } else if LoginController.userType == 1 {
                data = SideMenuController.jobSeekerMenu
            } else if LoginController.userType == 2 {
                data = SideMenuController.recruiterMenu
            }
        }
        
        tableView.reloadData()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        if maskButton != nil {
            maskButton.removeFromSuperview()
            maskButton = nil
        }
    }
    
    static func pushController(id: String) {
        
        AppHelper.hideLoading()
        
        SideMenuController.currentID = id
        
        var identifier = SideMenuController.menuItems[SideMenuController.currentID]?["identifier"]
        if AppData.user.isRecruiter() && id == "applications" {
            identifier = "SelectJob"
        }
        
        let revealController = UIApplication.shared.keyWindow?.rootViewController as! SWRevealViewController
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: identifier!)
        let navController = UINavigationController(rootViewController: controller)
        controller.navigationItem.leftBarButtonItem = UIBarButtonItem(image: UIImage(named: "menu"),
                                                                       style: .plain,
                                                                       target: revealController,
                                                                       action: #selector(SWRevealViewController.revealToggle(_:)))
        revealController.pushFrontViewController(navController, animated: true)
        
    }

}

extension SideMenuController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count;
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "SideMenuCell", for: indexPath) as! SideMenuCell
        
        let id = data[indexPath.row]
        let item = SideMenuController.menuItems[id]!
        
        cell.nameLabel.text = item["title"]
        
        let image = UIImage(named: item["icon"]!)
        if SideMenuController.currentID == id {
            cell.iconView.image = image?.withRenderingMode(.alwaysTemplate)
            cell.iconView.tintColor = AppData.greenColor
            cell.nameLabel.textColor = AppData.greenColor
        } else {
            cell.isUserInteractionEnabled = true
            let pers = item["per"]?.characters
            if AppData.user.isJobSeeker() || (!AppData.user.isRecruiter() && LoginController.userType == 1) {
                if pers!.contains("J") && AppData.jobSeeker == nil {
                    cell.isUserInteractionEnabled = false
                } else if pers!.contains("P") && AppData.profile == nil {
                    cell.isUserInteractionEnabled = false
                }
            } else {
                if pers!.contains("B") && AppData.user.businesses.count == 0 {
                    cell.isUserInteractionEnabled = false
                }
            }
            
            cell.iconView.image = image
            cell.iconView.alpha = cell.isUserInteractionEnabled ? 0.8 : 0.3
            cell.nameLabel.textColor = UIColor(colorLiteralRed: 1, green: 1, blue: 1, alpha: cell.isUserInteractionEnabled ? 0.8 : 0.3)
        }
        
        if indexPath.row == 0 {
            cell.addLine(frame: CGRect(x: 10, y: 0, width:  cell.frame.size.width - 60 - 20, height: 0.5),
                         color: UIColor(colorLiteralRed: 0, green: 0, blue: 0, alpha: 0.1))
            cell.addLine(frame: CGRect(x: 10, y: 0.5, width:  cell.frame.size.width - 60 - 20, height: 0.5),
                         color: UIColor(colorLiteralRed: 1, green: 1, blue: 1, alpha: 0.06))
        }
        
        cell.addLine(frame: CGRect(x: 10, y: cell.frame.size.height - 1, width:  cell.frame.size.width - 60 - 20, height: 0.5),
                     color: UIColor(colorLiteralRed: 0, green: 0, blue: 0, alpha: 0.1))
        cell.addLine(frame: CGRect(x: 10, y: cell.frame.size.height - 0.5, width:  cell.frame.size.width - 60 - 20, height: 0.5),
                     color: UIColor(colorLiteralRed: 1, green: 1, blue: 1, alpha: 0.1))
        
        return cell
    }
    
}

extension SideMenuController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        let id = data[indexPath.row]
        
        if SideMenuController.menuItems[id]?["identifier"] == "" {
            return
        }
        
        if SideMenuController.currentID == id {
            revealViewController().revealToggle(animated: true)
            return
        }
        
        if id == "log_out" {
            let popupController = PopupController.show((UIApplication.shared.keyWindow?.rootViewController)!,
                                                       message: "Are you sure you want to log out?",
                                                       ok: "Log Out", okCallback: {
                                                        SideMenuController.pushController(id: id)
            }, cancel: "Cancel", cancelCallback: nil)
            popupController.okButton?.backgroundColor = AppData.greenColor
        } else if id == "contact_us" {
            let url = URL(string: "mailto:support@myjobpitch.com")!
            UIApplication.shared.openURL(url)
            //revealViewController().revealToggle(animated: false)
        } else  {
            SideMenuController.pushController(id: id)
        }

    }
    
}
