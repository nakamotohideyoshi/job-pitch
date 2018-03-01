//
//  HelpController.swift
//  MyJobPitch
//
//  Created by dev on 12/11/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

class HelpController: UITableViewController {
    
    var shareData: NSMutableDictionary = NSMutableDictionary()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        
        let attributes = [
            NSFontAttributeName: UIFont(name: "Georgia-Bold", size: 22),
            NSForegroundColorAttributeName: UIColor.white,
        ]
        let title = NSMutableAttributedString(string: "My Job Pitch", attributes: attributes)
        title.addAttribute(NSForegroundColorAttributeName,
                           value: AppData.greenColor,
                           range: NSRange(location: 7, length: 5))

        let label = UILabel()
        label.attributedText = title
        navigationItem.titleView = label
        label.sizeToFit()
    }

    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        
        let titles = [
            "about": "About",
            "help": "How it works",
            "terms": "Terms and Conditions",
            "privacy": "Privacy Policy"
        ]
        
        let webView = segue.destination as! WebViewController
        webView.navigationItem.title = titles[segue.identifier!]
        if segue.identifier == "help" {
            if let user = AppData.user {
                if user.isJobSeeker() || (!user.isRecruiter() && LoginController.userType == 1) {
                    webView.file = "help-jobseeker"
                } else {
                    webView.file = "help-recruiter"
                }
            }
        } else {
            webView.file = segue.identifier
        }        
    }
    
    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if indexPath.row == 4 {
            let itemProvider = MyCustomProvider(placeholderItem: "")
            let controller = UIActivityViewController(activityItems: [itemProvider], applicationActivities: nil)
            present(controller, animated: true, completion: nil)
        } else if indexPath.row == 5 {
            let url = URL(string: "https://twitter.com/myjobpitch")!
            UIApplication.shared.openURL(url)
        }
    }
    
}

class MyCustomProvider: UIActivityItemProvider {
    
    override func activityViewController(_ activityViewController: UIActivityViewController, itemForActivityType activityType: UIActivityType) -> Any? {
        if activityType == UIActivityType.postToFacebook {
            UIPasteboard.general.string = AppData.user.isRecruiter() ? "https://www.myjobpitch.com/recruiters/" : "https://www.myjobpitch.com/candidates/";
            return ""
        }
        return AppData.user.isRecruiter() ? "https://www.myjobpitch.com/recruiters/" : "https://www.myjobpitch.com/candidates/";
    }
    
    override func activityViewController(_ activityViewController: UIActivityViewController, subjectForActivityType activityType: UIActivityType?) -> String {
        if activityType?.rawValue == "com.apple.UIKit.activity.Mail" {
            return AppData.user.isRecruiter() ? "https://www.myjobpitch.com/recruiters/" : "https://www.myjobpitch.com/candidates/";
        }
        return ""
    }
    
}
