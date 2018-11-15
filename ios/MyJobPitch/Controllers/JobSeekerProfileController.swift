//
//  JobseekerProfileController.swift
//  MyJobPitch
//
//  Created by dev on 12/28/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import AssetsLibrary
import AVFoundation
import AVKit

class JobseekerProfileController: MJPController {

    @IBOutlet weak var photoView: UIImageView!
    @IBOutlet weak var active: UISwitch!
    @IBOutlet weak var firstName: UITextField!
    @IBOutlet weak var firstNameError: UILabel!
    @IBOutlet weak var lastName: UITextField!
    @IBOutlet weak var lastNameError: UILabel!
    
    @IBOutlet weak var email: UITextField!
    @IBOutlet weak var emailPublic: UISwitch!
    @IBOutlet weak var telephone: UITextField!
    @IBOutlet weak var telephonePublic: UISwitch!
    @IBOutlet weak var mobile: UITextField!
    @IBOutlet weak var mobilePublic: UISwitch!
    @IBOutlet weak var age: UITextField!
    @IBOutlet weak var agePublic: UISwitch!
    @IBOutlet weak var sex: ButtonTextField!
    @IBOutlet weak var sexPublic: UISwitch!
    @IBOutlet weak var nationality: ButtonTextField!
    @IBOutlet weak var nationalityPublic: UISwitch!
    @IBOutlet weak var nationalNumber: UITextField!
    @IBOutlet weak var descView: UITextView!
    @IBOutlet weak var descError: UILabel!
    @IBOutlet weak var cvComment: UILabel!
    @IBOutlet weak var cvCancelButton: UIButton!
    @IBOutlet weak var cvRemoveButton: GreyButton!
    @IBOutlet weak var cvViewButton: YellowButton!
    @IBOutlet weak var playButtonView: UIView!
    @IBOutlet weak var hasReferences: UISwitch!
    @IBOutlet weak var tickBox: UISwitch!
    
    var sexNames = [String]()
    var selectedSexNames = [String]()
    
    var nationalityNames = [String]()
    var selectedNationalityNames = [String]()
    
    var photoPicker: ImagePicker!
    var photoImage: UIImage!
    var cvPicker: ImagePicker!
    var cvdata: Data!
    var videoUrl: URL!
    
    public var saveComplete: (() -> Void)?
    
    override func viewDidLoad() {
        super.viewDidLoad()
                
        photoPicker = ImagePicker()
        photoPicker.delegate = self
        
        cvPicker = ImagePicker()
        cvPicker.delegate = self
        
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
        
        // load jobseeker data
        
        if (AppData.jobseeker == nil) {
            photoView.image = UIImage(named: "avatar")
            email.text = AppData.email
            cvViewButton.isHidden = true            
        } else {
            load()
        }
    }
    
    override func getRequiredFields() -> [String: (UIView, UILabel)] {
        return [
            "first_name":   (firstName, firstNameError),
            "last_name":    (lastName, lastNameError),
            "description":  (descView, descError)
        ]
    }
    
    func load() {
        
        let jobseeker = AppData.jobseeker!
        
        if jobseeker.profileThumb != nil {
            AppHelper.loadImageURL(imageUrl: jobseeker.profileThumb, imageView: photoView, completion: nil)
        } else {
            photoView.image = UIImage(named: "avatar")
        }
        
        active.isOn = jobseeker.active
        firstName.text = jobseeker.firstName.capitalized
        lastName.text = jobseeker.lastName.capitalized
        email.text = jobseeker.email
        emailPublic.isOn = jobseeker.emailPublic
        telephone.text = jobseeker.telephone
        telephonePublic.isOn = jobseeker.telephonePublic
        mobile.text = jobseeker.mobile
        mobilePublic.isOn = jobseeker.mobilePublic
        age.text = jobseeker.age?.stringValue
        agePublic.isOn = jobseeker.agePublic
        
        if jobseeker.sex != nil {
            selectedSexNames = (AppData.sexes.filter { $0.id == jobseeker.sex }).map { $0.name }
            sex.text = selectedSexNames.joined(separator: ", ")
        }
        sexPublic.isOn = jobseeker.sexPublic
        
        if jobseeker.nationality != nil {
            selectedNationalityNames = (AppData.nationalities.filter { $0.id == jobseeker.nationality }).map { $0.name }
            nationality.text = selectedNationalityNames.joined(separator: ", ")
        }
        nationalityPublic.isOn = jobseeker.nationalityPublic
        
        nationalNumber.text = jobseeker.national_insurance_number
        
        descView.text = jobseeker.desc
        
        cvViewButton.isHidden = jobseeker.cv == nil
        cvRemoveButton.isHidden = jobseeker.cv == nil
                
        playButtonView.isHidden = jobseeker.getPitch() == nil
        
        hasReferences.isOn = jobseeker.hasReferences
        tickBox.isOn = jobseeker.truthConfirmation
    }
    
    @IBAction func photoAction(_ sender: Any) {
        photoPicker.present(self, target: sender as! UIView)
    }

    @IBAction func onActivate(_ sender: Any) {
        if !self.active.isOn {
            PopupController.showGreen("Your profile will not be visible and will not be able to apply for jobs or send messages", ok: "Deactivate", okCallback: nil, cancel: "Cancel", cancelCallback: {
                self.active.isOn = true
            })
        }
    }
    
    @IBAction func nationalNumberHelp(_ sender: Any) {
        PopupController.showGray("Supplying your national insurance number makes it easier for employers to recruit you. Your National Insurance number will not be shared with employers.", ok: "Close")
    }
    
    
    @IBAction func cvHelpAction(_ sender: Any) {
        PopupController.showGray("CV summary is what the recruiter first see, write if you have previous relevant experience where and for how long.", ok: "Close")
    }
    
    @IBAction func cvViewAction(_ sender: Any) {
        let url = URL(string: AppData.jobseeker.cv)!
        if #available(iOS 10.0, *) {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        } else {
            UIApplication.shared.openURL(url)
        }
    }
    
    @IBAction func cvAddHelpAction(_ sender: Any) {
        PopupController.showGray("Upload your CV using your favourite cloud service, or take a photo if you have it printed out.", ok: "Close")
    }
    
    @IBAction func cvCancelAction(_ sender: Any) {
        cvdata = nil
        cvComment.text = ""
        cvCancelButton.isHidden = true
    }
    
    @IBAction func cvRemoveAction(_ sender: Any) {
        cvViewButton.isHidden = true
        cvRemoveButton.isHidden = true
    }
    
    @IBAction func cvAddAction(_ sender: Any) {
        cvPicker.present(self, target: sender as! UIView)
    }
    
    @IBAction func pitchHelpAction(_ sender: Any) {
        let controller = WebViewController.instantiate()
        controller.navigationItem.title = "Recording Pitch"
        controller.file = "pitch"
        controller.isModal = true
        present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
    }
    
    @IBAction func playDemoAction(_ sender: Any) {
        let url = URL(string: "https://vimeo.com/255467562")!
        if #available(iOS 10.0, *) {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        } else {
            UIApplication.shared.openURL(url)
        }
    }
    
    @IBAction func pitchRecordAction(_ sender: Any) {
        let controller = CameraController.instantiate()
        controller.complete = { (videoUrl) in
            self.videoUrl = videoUrl
            self.playButtonView.isHidden = false
        }
        present(controller, animated: true, completion: nil)
    }
    
    @IBAction func pitchPlayAction(_ sender: Any) {
        
        var url = videoUrl
        
        if url == nil {
            if let video = AppData.jobseeker.getPitch()?.video {
                url = URL(string: video)
            }
        }
        
        if url != nil {
            let player = AVPlayer(url: url!)
            let playerController = AVPlayerViewController();
            playerController.player = player
            present(playerController, animated: true, completion: nil)
        }
    }

    @IBAction func saveAction(_ sender: Any) {
        
        if !valid() {
            return
        }
        
        if !tickBox.isOn {
            PopupController.showGray("You must check the box confirming the truth of the information you have provided.", ok: "OK")
            return
        }
        
        let jobseeker = Jobseeker()
        jobseeker.id = AppData.jobseeker?.id
        jobseeker.active = active.isOn
        jobseeker.firstName = firstName.text?.capitalized
        jobseeker.lastName = lastName.text?.capitalized
        jobseeker.email = AppData.email
        jobseeker.telephone = telephone.text
        jobseeker.mobile = mobile.text
        
        if let intAge = Int(age.text!) {
            jobseeker.age = NSNumber(value: intAge)
        }
        
        if selectedSexNames.count > 0 {
            jobseeker.sex = AppData.getIdByName(AppData.sexes, name: selectedSexNames[0])
        }
        
        if selectedNationalityNames.count > 0 {
            jobseeker.nationality = AppData.getIdByName(AppData.nationalities, name: selectedNationalityNames[0])
        }
        
        if (nationalNumber.text?.isEmpty == false) {
            jobseeker.national_insurance_number = nationalNumber.text
        }
        
        jobseeker.emailPublic = emailPublic.isOn
        jobseeker.telephonePublic = telephonePublic.isOn
        jobseeker.mobilePublic = mobilePublic.isOn
        jobseeker.agePublic = agePublic.isOn
        jobseeker.sexPublic = sexPublic.isOn
        jobseeker.nationalityPublic = nationalityPublic.isOn
        jobseeker.desc = descView.text
        jobseeker.hasReferences = hasReferences.isOn
        jobseeker.truthConfirmation = tickBox.isOn
        
        if !cvViewButton.isHidden {
            jobseeker.cv = AppData.jobseeker?.cv
        }
        
        showLoading()
        
        API.shared().saveJobseeker(jobseeker, photo: photoImage, cvdata: cvdata, progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
            
            if self.photoImage != nil || self.cvdata != nil {
                let rate = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
                self.showLoading("Uploading data...", withProgress: rate)
            }
            
        }) { (result, error) in
            
            if (error != nil) {
                self.handleError(error)
                return
            }
            
            AppData.jobseeker = result
            
            self.cvViewButton.isHidden = AppData.jobseeker.cv == nil
            
            if self.videoUrl != nil {
                
                self.showLoading()
                
                API.shared().savePitch(Pitch()) { (result, error) in
                    if error != nil {
                        self.handleError(error)
                        return
                    }
                    
                    PitchUploader().uploadVideo(self.videoUrl, pitch: result as! Pitch, endpoint: "pitches", progress: { (progress) in
                        if progress < 1 {
                            self.showLoading("Uploading Pitch...", withProgress: progress)
                        } else {
                            self.showLoading()
                        }
                    }) { pitch in
                        if pitch == nil {
                            self.handleError(error)
                            return
                        }

                        self.videoUrl = nil
                        AppData.jobseeker.pitches = [pitch!]
                        self.saveSuccess()
                    }
                }
            } else {
                self.saveSuccess()
            }
        }
    }
    
    func saveSuccess() {
        if AppData.user.jobseeker == nil {
            AppData.user.jobseeker = AppData.jobseeker.id
            SideMenuController.pushController(id: "job_profile")
        } else {
            closeController()
        }
        
        saveComplete?()
    }
    
    static func instantiate() -> JobseekerProfileController {
        return AppHelper.instantiate("JobseekerProfile") as! JobseekerProfileController
    }
    
}

extension JobseekerProfileController: ImagePickerDelegate {
    
    func imageSelected(_ picker: ImagePicker, image: UIImage) {
        if picker == photoPicker {
            photoImage = image
            photoView.image = image
        } else {
            cvdata = UIImagePNGRepresentation(image)
            cvComment.text = "CV added: save to upload."
            cvCancelButton.isHidden = false
        }
    }
}
