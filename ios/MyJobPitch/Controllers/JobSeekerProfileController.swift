//
//  JobSeekerProfileController.swift
//  MyJobPitch
//
//  Created by dev on 12/28/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import AssetsLibrary
import AVFoundation
import AVKit

class JobSeekerProfileController: MJPController {

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
    @IBOutlet weak var cvRemoveButton: UIButton!
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
        
        if (AppData.jobSeeker == nil) {
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
        
        let jobSeeker = AppData.jobSeeker!
        
        if jobSeeker.profileThumb != nil {
            AppHelper.loadImageURL(imageUrl: jobSeeker.profileThumb, imageView: photoView, completion: nil)
        } else {
            photoView.image = UIImage(named: "avatar")
        }
        
        active.isOn = jobSeeker.active
        firstName.text = jobSeeker.firstName.capitalized
        lastName.text = jobSeeker.lastName.capitalized
        email.text = jobSeeker.email
        emailPublic.isOn = jobSeeker.emailPublic
        telephone.text = jobSeeker.telephone
        telephonePublic.isOn = jobSeeker.telephonePublic
        mobile.text = jobSeeker.mobile
        mobilePublic.isOn = jobSeeker.mobilePublic
        age.text = jobSeeker.age?.stringValue
        agePublic.isOn = jobSeeker.agePublic
        
        if jobSeeker.sex != nil {
            selectedSexNames = (AppData.sexes.filter { $0.id == jobSeeker.sex }).map { $0.name }
            sex.text = selectedSexNames.joined(separator: ", ")
        }
        sexPublic.isOn = jobSeeker.sexPublic
        
        if jobSeeker.nationality != nil {
            selectedNationalityNames = (AppData.nationalities.filter { $0.id == jobSeeker.nationality }).map { $0.name }
            nationality.text = selectedNationalityNames.joined(separator: ", ")
        }
        nationalityPublic.isOn = jobSeeker.nationalityPublic
        
        nationalNumber.text = jobSeeker.national_insurance_number
        
        descView.text = jobSeeker.desc
        
        cvViewButton.isHidden = jobSeeker.cv == nil
        
        playButtonView.isHidden = jobSeeker.getPitch() == nil
        
        hasReferences.isOn = jobSeeker.hasReferences
        tickBox.isOn = jobSeeker.truthConfirmation
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
            if let video = AppData.jobSeeker.getPitch()?.video {
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
        
        let jobSeeker = JobSeeker()
        jobSeeker.id = AppData.jobSeeker?.id
        jobSeeker.active = active.isOn
        jobSeeker.firstName = firstName.text?.capitalized
        jobSeeker.lastName = lastName.text?.capitalized
        jobSeeker.email = AppData.email
        jobSeeker.telephone = telephone.text
        jobSeeker.mobile = mobile.text
        
        if let intAge = Int(age.text!) {
            jobSeeker.age = NSNumber(value: intAge)
        }
        
        if selectedSexNames.count > 0 {
            jobSeeker.sex = AppData.getIdByName(AppData.sexes, name: selectedSexNames[0])
        }
        
        if selectedNationalityNames.count > 0 {
            jobSeeker.nationality = AppData.getIdByName(AppData.nationalities, name: selectedNationalityNames[0])
        }
        
        if (nationalNumber.text?.isEmpty == false) {
            jobSeeker.national_insurance_number = nationalNumber.text
        }
        
        jobSeeker.emailPublic = emailPublic.isOn
        jobSeeker.telephonePublic = telephonePublic.isOn
        jobSeeker.mobilePublic = mobilePublic.isOn
        jobSeeker.agePublic = agePublic.isOn
        jobSeeker.sexPublic = sexPublic.isOn
        jobSeeker.nationalityPublic = nationalityPublic.isOn
        jobSeeker.desc = descView.text
        jobSeeker.hasReferences = hasReferences.isOn
        jobSeeker.truthConfirmation = tickBox.isOn
        
        showLoading()
        
        API.shared().saveJobSeeker(jobSeeker, photo: photoImage, cvdata: cvdata, progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
            
            if self.photoImage != nil || self.cvdata != nil {
                let rate = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
                self.showLoading("Uploading data...", withProgress: rate)
            }
            
        }) { (result, error) in
            
            if (error != nil) {
                self.handleError(error)
                return
            }
            
            AppData.jobSeeker = result
            
            self.cvViewButton.isHidden = AppData.jobSeeker.cv == nil
            
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
                        AppData.jobSeeker.pitches = [pitch!]
                        self.saveSuccess()
                    }
                }
            } else {
                self.saveSuccess()
            }
        }
    }
    
    func saveSuccess() {
        if AppData.user.jobSeeker == nil {
            AppData.user.jobSeeker = AppData.jobSeeker.id
            SideMenuController.pushController(id: "job_profile")
        } else {
            closeController()
        }
    }
    
    static func instantiate() -> JobSeekerProfileController {
        return AppHelper.instantiate("JobSeekerProfile") as! JobSeekerProfileController
    }
    
}

extension JobSeekerProfileController: ImagePickerDelegate {
    
    func imageSelected(_ picker: ImagePicker, image: UIImage) {
        if picker == photoPicker {
            photoImage = image
            photoView.image = image
        } else {
            cvdata = UIImagePNGRepresentation(image)
            cvComment.text = "CV added: save to upload."
            cvRemoveButton.isHidden = false
        }
    }
}
