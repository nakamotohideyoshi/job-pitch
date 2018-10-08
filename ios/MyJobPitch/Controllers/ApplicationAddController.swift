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
    @IBOutlet weak var cvComment: UILabel!
    @IBOutlet weak var cvRemoveButton: UIButton!
    @IBOutlet weak var cvViewButton: YellowButton!
    @IBOutlet weak var shortlisted: UISwitch!
    
    public var job: Job!
    
    var sexNames = [String]()
    var selectedSexNames = [String]()
    
    var nationalityNames = [String]()
    var selectedNationalityNames = [String]()
    
    var cvPicker: ImagePicker!
    var cvdata: Data!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        isModal = true
        
        cvPicker = ImagePicker()
        cvPicker.delegate = self
        
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
    
    override func getRequiredFields() -> [String: (UIView, UILabel)] {
        return [
            "first_name":   (firstName, firstNameError),
            "last_name":    (lastName, lastNameError),
            "description":  (descView, descError)
        ]
    }
    
    @IBAction func nationalNumberHelp(_ sender: Any) {
        PopupController.showGray("Supplying your national insurance number makes it easier for employers to recruit you. Your National Insurance number will not be shared with employers.", ok: "Close")
    }
    
    
    @IBAction func cvHelpAction(_ sender: Any) {
        PopupController.showGray("CV summary is what the recruiter first see, write if you have previous relevant experience where and for how long.", ok: "Close")
    }
    
    @IBAction func cvViewAction(_ sender: Any) {
        let url = URL(string: AppData.jobSeeker.cv)!
        if #available(iOS 10.0, *) {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        } else {
            UIApplication.shared.openURL(url)
        }
    }
    
    @IBAction func cvAddHelpAction(_ sender: Any) {
        PopupController.showGray("Upload your CV using your favourite cloud service, or take a photo if you have it printed out.", ok: "Close")
    }
    
    @IBAction func cvRemoveAction(_ sender: Any) {
        cvdata = nil
        cvComment.text = ""
        cvRemoveButton.isHidden = true
    }
    
    @IBAction func cvAddAction(_ sender: Any) {
        cvPicker.present(self, target: sender as! UIView)
    }
    
    @IBAction func saveAction(_ sender: Any) {
        
        if !valid() {
            return
        }
        
        var jobSeeker: [String: Any] = [:]
        
        jobSeeker["first_name"] = firstName.text?.trimmingCharacters(in: .whitespacesAndNewlines).capitalized
        jobSeeker["last_name"] = lastName.text?.trimmingCharacters(in: .whitespacesAndNewlines).capitalized
        
        if let str = email.text?.trimmingCharacters(in: .whitespacesAndNewlines) {
            if !str.isEmpty {
                jobSeeker["email"] = str
            }
        }
        
        if let str = telephone.text {
            if !str.isEmpty {
                jobSeeker["telephone"] = str
            }
        }
        
        if let str = mobile.text {
            if !str.isEmpty {
                jobSeeker["mobile"] = str
            }
        }
        
        if let n = Int(age.text!) {
            jobSeeker["age"] = NSNumber(value: n)
        }
        
        if selectedSexNames.count > 0 {
            jobSeeker["sex"] = AppData.getIdByName(AppData.sexes, name: selectedSexNames[0])
        }
        
        if selectedNationalityNames.count > 0 {
            jobSeeker["nationality"] = AppData.getIdByName(AppData.nationalities, name: selectedNationalityNames[0])
        }
        
        if let str = nationalNumber.text?.trimmingCharacters(in: .whitespacesAndNewlines) {
            if !str.isEmpty {
                jobSeeker["national_insurance_number"] = str
            }
        }
        
        jobSeeker["description"] = descView.text.trimmingCharacters(in: .whitespacesAndNewlines)
        
        jobSeeker["email_public"] = true
        jobSeeker["mobile_public"] = true
        jobSeeker["telephone_public"] = true
        jobSeeker["age_public"] = true
        jobSeeker["sex_public"] = true
        jobSeeker["nationality_public"] = true
        jobSeeker["has_references"] = false
        jobSeeker["truth_confirmation"] = false
        
        let application = ExternalApplicationForCreation()
        application.job = job.id
        application.shortlisted = shortlisted.isOn
        application.jobSeeker = jobSeeker
        
        showLoading()
        
        API.shared().createExternalApplication(application, cvdata: cvdata, progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
            
            if self.cvdata != nil {
                let rate = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
                self.showLoading("Uploading data...", withProgress: rate)
            }
            
        }) { (result, error) in
            
            if error != nil {
                self.handleError(error)
                return
            }
            
            AppData.getApplication((result?.id)!) { (_, _) in
                self.closeController()
            }
        }
    }
    
    static func instantiate() -> ApplicationAddController {
        return AppHelper.instantiate("ApplicationAdd") as! ApplicationAddController
    }
    
}

extension ApplicationAddController: ImagePickerDelegate {
    
    func imageSelected(_ picker: ImagePicker, image: UIImage) {
        cvdata = UIImagePNGRepresentation(image)
        cvComment.text = "CV added: save to upload."
        cvRemoveButton.isHidden = false
    }
}

