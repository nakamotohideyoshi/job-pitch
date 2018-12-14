//
//  HREmployeeEditController.swift
//  MyJobPitch
//
//  Created by bb on 11/5/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class HREmployeeEditController: MJPController {

    @IBOutlet weak var photoView: UIImageView!
    @IBOutlet weak var firstName: UITextField!
    @IBOutlet weak var firstNameError: UILabel!
    @IBOutlet weak var lastName: UITextField!
    @IBOutlet weak var lastNameError: UILabel!
    @IBOutlet weak var email: UITextField!
    @IBOutlet weak var telephone: UITextField!
    @IBOutlet weak var birthdayField: UITextField!
    @IBOutlet weak var sex: ButtonTextField!
    @IBOutlet weak var nationality: ButtonTextField!
    @IBOutlet weak var nationalNumber: UITextField!
    
    @IBOutlet weak var business: ButtonTextField!
    @IBOutlet weak var businessError: UILabel!
    @IBOutlet weak var job: ButtonTextField!
    @IBOutlet weak var jobError: UILabel!
    
    var photoPicker: ImagePicker!
    var photoImage: UIImage!
    
    var sexNames = [String]()
    var selectedSexNames = [String]()
    
    var birthday: Date!
    
    var nationalityNames = [String]()
    var selectedNationalityNames = [String]()
    
    var businessNames = [String]()
    var selectedBusinessNames = [String]()
    
    var jobNames = [String]()
    var selectedJobNames = [String]()
    
    public var employee: HREmployee!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        title = employee == nil ? NSLocalizedString("Add Employee", comment: "") : NSLocalizedString("Edit Employee", comment: "")
        isModal = true
        
        photoPicker = ImagePicker()
        photoPicker.delegate = self
        
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
        
        birthdayField.delegate = self
        
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
        
        businessNames = AppData.businesses.map { $0.name }
        business.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.businessNames,
                                          selectedItems: self.selectedBusinessNames,
                                          multiSelection: false,
                                          search: false,
                                          doneCallback: { (items) in
                                            self.selectedBusinessNames = items
                                            self.business.text = items.joined(separator: ", ")
            })
        }
        
        jobNames = AppData.hrJobs.map { $0.title }
        job.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.jobNames,
                                          selectedItems: self.selectedJobNames,
                                          multiSelection: false,
                                          search: false,
                                          doneCallback: { (items) in
                                            self.selectedJobNames = items
                                            self.job.text = items.joined(separator: ", ")
            })
        }
        
        if (employee != nil) {
            load()
        }
    }
    
    func load() {
        
        if employee.profileThumb != nil {
            AppHelper.loadImageURL(imageUrl: employee.profileThumb, imageView: photoView, completion: nil)
        }
        
        firstName.text = employee.firstName.capitalized
        lastName.text = employee.lastName.capitalized
        email.text = employee.email
        telephone.text = employee.telephone
        
        if employee.sex != nil {
            selectedSexNames = (AppData.sexes.filter { $0.id == employee.sex }).map { $0.name }
            sex.text = selectedSexNames.joined(separator: ", ")
        }
        
        if employee.birthday != nil {
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "YYYY-MM-dd"
            guard let date = dateFormatter.date(from: employee.birthday) else {
                fatalError()
            }
            birthday = date
            birthdayField.text = AppHelper.dateToLongString(birthday)
        }

        if employee.nationality != nil {
            selectedNationalityNames = (AppData.nationalities.filter { $0.id == employee.nationality }).map { $0.name }
            nationality.text = selectedNationalityNames.joined(separator: ", ")
        }
        
        nationalNumber.text = employee.national_insurance_number
        
        if employee.business != nil {
            selectedBusinessNames = (AppData.businesses.filter { $0.id == employee.business }).map { $0.name }
            business.text = selectedBusinessNames.joined(separator: ", ")
        }
        
        if employee.job != nil {
            selectedJobNames = (AppData.hrJobs.filter { $0.id == employee.job }).map { $0.title }
            job.text = selectedJobNames.joined(separator: ", ")
        }
    }
    
    override func getRequiredFields() -> [String: (UIView, UILabel)] {
        return [
            "first_name":   (firstName, firstNameError),
            "last_name":    (lastName, lastNameError),
            "business":  (business, businessError),
            "job":  (job, jobError)
        ]
    }
    
    @IBAction func photoAction(_ sender: Any) {
        photoPicker.present(self, target: sender as! UIView)
    }
    
    @IBAction func nationalNumberHelp(_ sender: Any) {
        PopupController.showGray(NSLocalizedString("Supplying your national insurance number makes it easier for employers to recruit you. Your National Insurance number will not be shared with employers.", comment: ""),
                                 ok: NSLocalizedString("Close", comment: ""))
    }
    
    @IBAction func saveAction(_ sender: Any) {
        if !valid() {
            return
        }
        
        let newEmployee = HREmployee()
        newEmployee.id = employee?.id
        newEmployee.firstName = firstName.text?.capitalized
        newEmployee.lastName = lastName.text?.capitalized
        newEmployee.email = email.text?.trimmingCharacters(in: .whitespacesAndNewlines)
        newEmployee.telephone = telephone.text
        
        if selectedSexNames.count > 0 {
            newEmployee.sex = AppData.getIdByName(AppData.sexes, name: selectedSexNames[0])
        }
        
        if birthday != nil {
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "YYYY-MM-dd"
            newEmployee.birthday = dateFormatter.string(from: birthday)
        }
        
        if selectedNationalityNames.count > 0 {
            newEmployee.nationality = AppData.getIdByName(AppData.nationalities, name: selectedNationalityNames[0])
        }
        
        newEmployee.national_insurance_number = nationalNumber.text
        
        let businesses = (AppData.businesses.filter { selectedBusinessNames.contains($0.name) }).map { $0.id }
        if businesses.count != 0 {
            newEmployee.business = businesses[0]
        }
        
        let jobs = (AppData.hrJobs.filter { selectedJobNames.contains($0.title) }).map { $0.id }
        if jobs.count != 0 {
            newEmployee.job = jobs[0]
        }
        
        showLoading()
        
        API.shared().saveHREmployee(newEmployee, photo: photoImage, progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
            
            if self.photoImage != nil {
                let rate = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
                self.showLoading(NSLocalizedString("Uploading data...", comment: ""), withProgress: rate)
            }
            
        }) { (employee, error) in
            
            if (error != nil) {
                self.handleError(error)
                return
            }
            
            if self.employee != nil {
                AppData.hrEmployees = AppData.hrEmployees.filter { $0.id != self.employee.id }
            }
            AppData.hrEmployees.insert(employee!, at: 0)
            
            self.closeController()
        }
    }
    
    static func instantiate() -> HREmployeeEditController {
        return AppHelper.instantiate("HREmployeeEdit") as! HREmployeeEditController
    }
}

extension HREmployeeEditController: UITextFieldDelegate {
    func textFieldShouldBeginEditing(_ textField: UITextField) -> Bool {
        if birthdayField == textField {
            let selector = WWCalendarTimeSelector.instantiate()
            selector.delegate = self
            selector.optionTopPanelTitle = NSLocalizedString("Choose Date", comment: "")
            if birthday != nil {
                selector.optionCurrentDate = birthday
            }
            selector.optionStyles.showYear(true)
            selector.optionStyles.showDateMonth(true)
            selector.optionStyles.showTime(false)
            
            present(selector, animated: true, completion: nil)
        }
        return false
    }
}

extension HREmployeeEditController: WWCalendarTimeSelectorProtocol {
    
    func WWCalendarTimeSelectorDone(_ selector: WWCalendarTimeSelector, date: Date) {
        birthday = date
        birthdayField.text = AppHelper.dateToLongString(birthday)
    }
}

extension HREmployeeEditController: ImagePickerDelegate {
    
    func imageSelected(_ picker: ImagePicker, image: UIImage) {
        photoImage = image
        photoView.image = image
    }
}

