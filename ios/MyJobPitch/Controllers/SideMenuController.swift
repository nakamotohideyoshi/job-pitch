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
        "find_job":     ["icon": "menu-search",         "title": NSLocalizedString("Find Job", comment: ""),                "identifier": "Swipe",              "per": "P"],
        "j_applications":["icon": "menu-applications2",   "title": NSLocalizedString("My Applications", comment: ""),            "identifier": "ApplicationList",    "per": "P"],
        "messages":     ["icon": "menu-message",        "title": NSLocalizedString("Messages", comment: ""),                "identifier": "MessageList",        "per": "PB"],
        "j_interviews":  ["icon": "menu-interview",        "title": NSLocalizedString("Interviews", comment: ""),             "identifier": "InterviewList",          "per": "P"],
        "job_profile":  ["icon": "menu-job-profile",    "title": NSLocalizedString("Job Profile", comment: ""),             "identifier": "JobProfile",         "per": "J"],
        "add_record":   ["icon": "menu-record",     "title": NSLocalizedString("Record Pitch", comment: ""),            "identifier": "Pitch",              "per": "J"],
        "view_profile": ["icon": "menu-user-profile",   "title": NSLocalizedString("Profile", comment: ""),                 "identifier": "JobseekerDetails",   "per": ""],
        "user_profile": ["icon": "menu-user-profile",   "title": NSLocalizedString("Profile", comment: ""),                 "identifier": "JobseekerProfile",   "per": ""],
        
        "find_talent":  ["icon": "menu-search",         "title": NSLocalizedString("Find Talent", comment: ""),             "identifier": "SelectJob",          "per": "B"],
        "applications": ["icon": "menu-applications1",    "title": NSLocalizedString("Applications", comment: ""),            "identifier": "SelectJob",    "per": "B"],
        "interviews":  ["icon": "menu-interview",        "title": NSLocalizedString("Interviews", comment: ""),             "identifier": "SelectJob",          "per": "B"],
        "businesses":   ["icon": "menu-business",       "title": NSLocalizedString("Add or Edit Jobs", comment: ""),        "identifier": "BusinessList",       "per": ""],
        "users":        ["icon": "menu-users",   "title": NSLocalizedString("Users", comment: ""),                   "identifier": "BusinessList",       "per": ""],
        
        "hr":           ["icon": "menu-users",   "title": NSLocalizedString("HR", comment: ""),                   "identifier": "HRSystem",       "per": ""],
        "employees":    ["icon": "menu-users",   "title": NSLocalizedString("Employees", comment: ""),                   "identifier": "EmployeeList",       "per": ""],
        
        "change_pass":  ["icon": "menu-key",            "title": NSLocalizedString("Change Password", comment: ""),         "identifier": "ChangePassword",     "per": ""],
        "help":         ["icon": "menu-help",           "title": NSLocalizedString("Help", comment: ""),                    "identifier": "Help",               "per": ""],
        "share":        ["icon": "menu-share",          "title": NSLocalizedString("Tell a friend", comment: ""),           "identifier": "Share",              "per": ""],
        "contact_us":   ["icon": "menu-contact-us",     "title": NSLocalizedString("Contact Us", comment: ""),              "identifier": "ContactUs",          "per": ""],
        "log_out":      ["icon": "menu-logout",         "title": NSLocalizedString("Log Out", comment: ""),                 "identifier": "Signin",             "per": ""]
    ]
    
    static let jobseekerMenu = [
        "find_job", "j_applications", "messages", "j_interviews", "job_profile", "add_record", "view_profile", "change_pass", "help", "share", "contact_us", "log_out"
    ]
    
    static let recruiterMenu = [
        "find_talent", "applications", "messages", "interviews", "businesses", "users", "change_pass", "help", "share", "contact_us", "log_out"
    ]
    
    static func getCurrentTitle(_ id: String!) -> String! {
        return menuItems[id == nil ? currentID : id]?["title"]
    }
    
    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var pictureView: UIImageView!
    @IBOutlet weak var nameView: UILabel!
    @IBOutlet weak var emailView: UILabel!
    
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
        
        pictureView.layer.cornerRadius = 30
        
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        data = [String]()
        
        if AppData.userRole == Role.ROLE_JOB_SEEKER_ID {
            AppHelper.loadPhoto(AppData.jobseeker, imageView: pictureView, completion: nil)
            nameView.text = AppData.jobseeker.getFullName()
            data = SideMenuController.jobseekerMenu
        } else {
            if AppData.businesses.count > 0 {
                AppHelper.loadLogo(AppData.businesses[0], imageView: pictureView, completion: nil)
                nameView.text = AppData.businesses[0].name
            }            
            data = SideMenuController.recruiterMenu
            if (AppData.businesses.filter { $0.hr_access }.count != 0) {
                data.insert("hr", at: 7)
            }
        }

        emailView.text = AppData.email
        
        if (AppData.user.employees.count != 0) {
            data.insert("employees", at: 7)
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
                
        SideMenuController.currentID = id
        
        var identifier = SideMenuController.menuItems[SideMenuController.currentID]?["identifier"]
        if AppData.user != nil {
            if AppData.user.jobseeker == nil && id == "view_profile" {
                identifier = "JobseekerProfile"
            }
        }
        
        
        let revealController = UIApplication.shared.keyWindow?.rootViewController as! SWRevealViewController
        let controller = AppHelper.instantiate(identifier!)
        controller.title = SideMenuController.menuItems[SideMenuController.currentID]?["title"]
        let navController = UINavigationController(rootViewController: controller)
        controller.navigationItem.leftBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav-menu"),
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
        
        cell.iconView.image = image?.withRenderingMode(.alwaysTemplate)
        cell.iconView.tintColor = AppData.darkColor
        if SideMenuController.currentID == id {
            cell.backgroundColor = AppData.lightGreyColor
//            cell.iconView.tintColor = AppData.greenColor
//            cell.iconView.alpha = 1
//            cell.nameLabel.textColor = AppData.greenColor
//            cell.nameLabel.alpha = 1
        } else {
            cell.isUserInteractionEnabled = true
            let pers = item["per"]
            if AppData.userRole == Role.ROLE_JOB_SEEKER_ID {
                if (pers!.contains("J") && AppData.user.jobseeker == nil) || (pers!.contains("P") && AppData.profile == nil) {
                    cell.isUserInteractionEnabled = false
                }
            } else {
                if pers!.contains("B") && AppData.businesses.count == 0 {
                    cell.isUserInteractionEnabled = false
                }
            }
            
            cell.backgroundColor = UIColor.white
//            cell.iconView.tintColor = AppData.darkColor
//            cell.iconView.alpha = cell.isUserInteractionEnabled ? 1 : 0.3
//            cell.nameLabel.textColor = AppData.darkColor
//            cell.nameLabel.alpha = cell.isUserInteractionEnabled ? 1 : 0.3
        }
        
        let newMessageCount = AppData.newMessageCount
        if id == "messages" && newMessageCount > 0 {
            cell.badge.isHidden = false
            cell.badge.text = newMessageCount < 10 ? "\(newMessageCount)" : "9+"
        } else {
            cell.badge.isHidden = true
        }
        
//        if (cell.layer.sublayers?.count)! <= 2 {
//            if indexPath.row == 0 {
//                cell.addLine(frame: CGRect(x: 10, y: 0, width:  cell.frame.size.width - 60 - 20, height: 0.5),
//                             color: UIColor(red: 0, green: 0, blue: 0, alpha: 0.1))
//                cell.addLine(frame: CGRect(x: 10, y: 0.5, width:  cell.frame.size.width - 60 - 20, height: 0.5),
//                             color: UIColor(red: 1, green: 1, blue: 1, alpha: 0.06))
//            }
//            cell.addLine(frame: CGRect(x: 10, y: cell.frame.size.height - 1, width:  cell.frame.size.width - 60 - 20, height: 0.5),
//                         color: UIColor(red: 0, green: 0, blue: 0, alpha: 0.1))
//            cell.addLine(frame: CGRect(x: 10, y: cell.frame.size.height - 0.5, width:  cell.frame.size.width - 60 - 20, height: 0.5),
//                         color: UIColor(red: 1, green: 1, blue: 1, alpha: 0.06))
//        }
        
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
                                                       message: NSLocalizedString("Are you sure you want to log out?", comment: ""),
                                                       ok: NSLocalizedString("Log Out", comment: ""), okCallback: {
                                                        SideMenuController.pushController(id: id)
            }, cancel: NSLocalizedString("Cancel", comment: ""), cancelCallback: nil)
            popupController.okButton?.backgroundColor = AppData.greenColor
        } else if id == "share" {
            let url = AppData.user.isRecruiter() ? "https://www.myjobpitch.com/recruiters/" : "https://www.myjobpitch.com/candidates/"
            let itemProvider = ShareProvider(placeholderItem: url)
            let controller = UIActivityViewController(activityItems: [itemProvider], applicationActivities: nil)
            present(controller, animated: true, completion: nil)
        } else if id == "contact_us" {
            let url = URL(string: "mailto:support@myjobpitch.com")!
            if #available(iOS 10.0, *) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            } else {
                UIApplication.shared.openURL(url)
            }
            //revealViewController().revealToggle(animated: false)
        } else {
            SideMenuController.pushController(id: id)
        }

    }
    
}

class ShareProvider: UIActivityItemProvider {
    
    override func activityViewController(_ activityViewController: UIActivityViewController, itemForActivityType activityType: UIActivityType) -> Any? {
        if activityType == UIActivityType.postToFacebook {
            UIPasteboard.general.string = placeholderItem as? String
            return ""
        }
        return placeholderItem as! String
    }
    
    override func activityViewController(_ activityViewController: UIActivityViewController, subjectForActivityType activityType: UIActivityType?) -> String {
        if activityType?.rawValue == "com.apple.UIKit.activity.Mail" {
            return placeholderItem as! String
        }
        return ""
    }
    
}
