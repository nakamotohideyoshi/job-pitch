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
            if AppData.userRole == Role.ROLE_JOB_SEEKER_ID {
                webView.file = "help-jobseeker"
            } else {
                webView.file = "help-recruiter"
            }
        } else {
            webView.file = segue.identifier
        }        
    }
    
}
