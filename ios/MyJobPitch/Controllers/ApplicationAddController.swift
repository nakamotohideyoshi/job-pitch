//
//  ApplicationAddController.swift
//  MyJobPitch
//
//  Created by bb on 9/13/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class ApplicationAddController: MJPController {
    
    @IBOutlet weak var infoView: AppInfoSmallView!
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
    
    public var job: Job!
    
    var sexNames = [String]()
    var selectedSexNames = [String]()
    
    var nationalityNames = [String]()
    var selectedNationalityNames = [String]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        isModal = true
        
        infoView.job = job
        infoView.addUnderLine(paddingLeft: 0, paddingRight: 0, color: AppData.greyColor)
        
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
        
        let application = ExternalApplicationForCreation()
        application.job = job.id
        application.shortlisted = shortlisted.isOn
        
        application.firstName = firstName.text?.capitalized
        application.lastName = lastName.text?.capitalized
        application.email = AppData.email
        application.telephone = telephone.text
        application.mobile = mobile.text
        
        if let intAge = Int(age.text!) {
            application.age = NSNumber(value: intAge)
        }
        
        if selectedSexNames.count > 0 {
            application.sex = AppData.getIdByName(AppData.sexes, name: selectedSexNames[0])
        }
        
        if selectedNationalityNames.count > 0 {
            application.nationality = AppData.getIdByName(AppData.nationalities, name: selectedNationalityNames[0])
        }
        
        if (nationalNumber.text?.isEmpty == false) {
            application.nationalInsuranceNumber = nationalNumber.text
        } else {
            application.nationalInsuranceNumber = nil
        }
        
        application.emailPublic = true
        application.telephonePublic = true
        application.mobilePublic = true
        application.agePublic = true
        application.sexPublic = true
        application.nationalityPublic = true
        application.desc = descView.text
        application.hasReferences = false
        application.truthConfirmation = false
        
        showLoading()
        
        API.shared().createExternalApplication(application: application, success: { (data) in
            let application = data as! Application
            AppData.getApplication(application.id, success: { (_) in
                self.closeModal()
            }, failure: { (_, _) in
                self.closeModal()
            })
        }, failure: self.handleErrors)
    }
    
    static func instantiate() -> ApplicationAddController {
        return AppHelper.instantiate("ApplicationAdd") as! ApplicationAddController
    }
    
}
