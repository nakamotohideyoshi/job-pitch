//
//  ApplicationAddController.swift
//  MyJobPitch
//
//  Created by bb on 9/13/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class ApplicationAddController: MJPController {
    
    @IBOutlet weak var jobImgView: UIImageView!
    @IBOutlet weak var jobTitleLabel: UILabel!
    @IBOutlet weak var jobSubTitleLabel: UILabel!
    @IBOutlet weak var firstName: UITextField!
    @IBOutlet weak var firstNameError: UILabel!
    @IBOutlet weak var lastName: UITextField!
    @IBOutlet weak var lastNameError: UILabel!
    @IBOutlet weak var email: UITextField!
    @IBOutlet weak var telephone: UITextField!
    @IBOutlet weak var mobile: UITextField!
    @IBOutlet weak var age: UITextField!
    @IBOutlet weak var sex: ButtonTextField!
    @IBOutlet weak var nationality: ButtonTextField!
    @IBOutlet weak var nationalNumber: UITextField!
    @IBOutlet weak var descView: UITextView!
    @IBOutlet weak var descError: UILabel!
    @IBOutlet weak var shortlisted: UISwitch!
    
    var job: Job!
    
    var sexNames = [String]()
    var selectedSexNames = [String]()
    
    var nationalityNames = [String]()
    var selectedNationalityNames = [String]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        isModal = true
        
        AppHelper.loadLogo(image: job.getImage(), imageView: jobImgView, completion: nil)
        jobTitleLabel.text = job.title
        jobSubTitleLabel.text = job.getBusinessName()
        jobImgView.superview?.addUnderLine(paddingLeft: 0, paddingRight: 0, color: AppData.greyColor)
        
        // load sex data
        
        sexNames = AppData.sexes.map { $0.name }
        sex.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.sexNames,
                                          selectedItems: self.selectedSexNames,
                                          multiSelection: false,
                                          search: false,
                                          doneCallback: { (items) in
                                            self.selectedSexNames = items
                                            self.sex.text = items.joined(separator: ", ")
            })
        }
        
        // load nationality data
        
        nationalityNames = AppData.nationalities.map { $0.name }
        nationality.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.nationalityNames,
                                          selectedItems: self.selectedNationalityNames,
                                          multiSelection: false,
                                          search: true,
                                          doneCallback: { (items) in
                                            self.selectedNationalityNames = items
                                            self.nationality.text = items.joined(separator: ", ")
            })
        }
    }
    
    override func getRequiredFields() -> [String: NSArray] {
        return [
            "first_name": [firstName, firstNameError],
            "last_name": [lastName, lastNameError],
            "description": [descView, descError]
        ]
    }
    
    @IBAction func nationalNumberHelp(_ sender: Any) {
        PopupController.showGray("Supplying your national insurance number makes it easier for employers to recruit you. Your National Insurance number will not be shared with employers.", ok: "Close")
    }
    
    
    @IBAction func cvHelpAction(_ sender: Any) {
        PopupController.showGray("CV summary is what the recruiter first see, write if you have previous relevant experience where and for how long.", ok: "Close")
    }
    
    @IBAction func saveAction(_ sender: Any) {
        
        if !valid() {
            return
        }
        
        let jobSeeker = JobSeeker()
        
        jobSeeker.firstName = firstName.text?.capitalized
        jobSeeker.lastName = lastName.text?.capitalized
        jobSeeker.email = AppData.email
        jobSeeker.telephone = telephone.text
        jobSeeker.mobile = mobile.text
        
        if let intAge = Int(age.text!) {
            jobSeeker.age = NSNumber(value: intAge)
        }
        
        if selectedSexNames.count > 0 {
            jobSeeker.sex = (AppData.sexes.filter { selectedSexNames.contains($0.name) })[0].id
        }
        
        if selectedNationalityNames.count > 0 {
            jobSeeker.nationality = (AppData.nationalities.filter { selectedNationalityNames.contains($0.name) })[0].id
        }
        
        if (nationalNumber.text?.isEmpty == false) {
            jobSeeker.national_insurance_number = nationalNumber.text
        } else {
            jobSeeker.national_insurance_number = nil
        }
        
        jobSeeker.emailPublic = true
        jobSeeker.telephonePublic = true
        jobSeeker.mobilePublic = true
        jobSeeker.agePublic = true
        jobSeeker.sexPublic = true
        jobSeeker.nationalityPublic = true
        jobSeeker.desc = descView.text
        jobSeeker.hasReferences = false
        jobSeeker.truthConfirmation = false
        
        let application = ExternalApplicationForCreation()
        application.job = job.id
        application.jobSeeker = jobSeeker;
        application.shortlisted = shortlisted.isOn
        
        AppHelper.showLoading("")
        
        API.shared().createExternalApplication(application: application, success: { (data) in
            AppHelper.hideLoading()
            self.closeAction()
        }, failure: self.handleErrors)
        
    }
    
    func closeAction() {
        dismiss(animated: true, completion: nil)
    }
    
    static func instantiate() -> ApplicationAddController {
        return AppHelper.instantiate("ApplicationAdd") as! ApplicationAddController
    }
    
}
