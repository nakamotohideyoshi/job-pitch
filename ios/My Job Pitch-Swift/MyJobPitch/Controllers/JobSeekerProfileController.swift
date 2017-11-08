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
    @IBOutlet weak var hasReferences: UISwitch!
    @IBOutlet weak var tickBox: UISwitch!
    @IBOutlet weak var playButtonView: UIView!
    @IBOutlet weak var cvViewButtonHeightConstraint: NSLayoutConstraint!
    @IBOutlet weak var cvRemoveButtonWidthConstraint: NSLayoutConstraint!
    
    var ipc: UIImagePickerController!
    
    var sexNames = [String]()
    var selectedSexNames = [String]()
    
    var nationalityNames = [String]()
    var selectedNationalityNames = [String]()
    
    var cvName: String!
    var cvdata: Data!
    var videoUrl: URL!
        
    var jobSeeker: JobSeeker!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        cvRemoveButtonWidthConstraint.constant = 0

        // load sex data
        
        for sex in AppData.sexes as! [Sex] {
            sexNames.append(sex.name)
        }
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
        
        for nationality in AppData.nationalities as! [Nationality] {
            nationalityNames.append(nationality.name)
        }
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
        
        if (AppData.user.jobSeeker != nil) {
            showLoading()
            API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
                self.hideLoading()
                self.jobSeeker = data as! JobSeeker
                self.load()
                AppData.existProfile = self.jobSeeker.profile != nil
            }, failure: self.handleErrors)
        } else {
            load()
        }
        
    }
    
    override func getRequiredFields() -> [String: NSArray] {
        return [
            "first_name": [firstName, firstNameError],
            "last_name": [lastName, lastNameError],
            "description": [descView, descError]
        ]
    }
    
    func load() {
        
        if jobSeeker != nil {
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
            
            for sex in AppData.sexes as! [Sex] {
                if jobSeeker.sex != nil && jobSeeker.sex == sex.id {
                    selectedSexNames.append(sex.name)
                }
            }
            sex.text = selectedSexNames.joined(separator: ", ")
            sexPublic.isOn = jobSeeker.sexPublic
            
            for nationality in AppData.nationalities as! [Nationality] {
                if jobSeeker.nationality != nil && jobSeeker.nationality == nationality.id {
                    selectedNationalityNames.append(nationality.name)
                }
            }
            nationality.text = selectedNationalityNames.joined(separator: ", ")
            nationalityPublic.isOn = jobSeeker.nationalityPublic
            
            nationalNumber.text = jobSeeker.national_insurance_number
            
            descView.text = jobSeeker.desc
            
            playButtonView.isHidden = jobSeeker.getPitch()?.video == nil
            
            hasReferences.isOn = jobSeeker.hasReferences
            tickBox.isOn = jobSeeker.truthConfirmation
            
            cvViewButtonHeightConstraint.constant = jobSeeker.cv != nil ? 50 : 0
        } else {
            email.text = AppData.email
            cvViewButtonHeightConstraint.constant = 0
        }
        
    }
    
    func showImagePickerController(type: UIImagePickerControllerSourceType) {
        if UIImagePickerController.isSourceTypeAvailable(type) {
            if ipc == nil {
                ipc = UIImagePickerController()
                ipc.delegate = self
            }
            ipc.sourceType = type
            present(ipc, animated: true, completion: nil)
        } else {
            PopupController.showGray("You don't have camera.", ok: "OK")
        }
    }

    
    @IBAction func cvHelpAction(_ sender: Any) {
        PopupController.showGray("CV summary is what the recruiter first see, write if you have previous relevant experience where and for how long.", ok: "Close")
    }
    
    @IBAction func cvViewAction(_ sender: Any) {
        UIApplication.shared.open(URL(string: jobSeeker.cv)!, options: [:], completionHandler: nil)
    }
    
    @IBAction func cvAddHelpAction(_ sender: Any) {
        PopupController.showGray("Upload your CV using your favourite cloud service, or take a photo if you have it printed out.", ok: "Close")
    }
    
    @IBAction func cvAddAction(_ sender: Any) {
        
        let actionSheet = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
        
        let cameraAction = UIAlertAction(title: "Take Photo", style: .default) { (_) in
            self.showImagePickerController(type: .camera)
        }
        actionSheet.addAction(cameraAction)
        
        let photoAction = UIAlertAction(title: "Photo library", style: .default) { (_) in
            self.showImagePickerController(type: .photoLibrary)
        }
        actionSheet.addAction(photoAction)
        
        let googledriveAction = UIAlertAction(title: "Google Drive", style: .default) { (_) in
            let browser = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "GoogleDrive") as! GoogleDriveController
            browser.downloadCallback = { (path) in
                self.setCV(path: path)
            }
            let navController = UINavigationController(rootViewController: browser)
            AppHelper.getFrontController().present(navController, animated: true, completion: nil)
        }
        actionSheet.addAction(googledriveAction)
        
        let dropboxAction = UIAlertAction(title: "Dropbox", style: .default) { (_) in
            let browser = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Dropbox") as! DropboxController
            browser.downloadCallback = { (path) in
                self.setCV(path: path)
            }
            let navController = UINavigationController(rootViewController: browser)
            AppHelper.getFrontController().present(navController, animated: true, completion: nil)
        }
        actionSheet.addAction(dropboxAction)
        
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel, handler: nil)
        actionSheet.addAction(cancelAction)
        
        present(actionSheet, animated: true, completion: nil)
        
    }
    @IBAction func cvRemoveAction(_ sender: Any) {
        cvdata = nil
        cvName = ""
        cvComment.text = ""
        cvRemoveButtonWidthConstraint.constant = 0
    }
    
    func setCV(path: String) {
        let url = URL(fileURLWithPath: path)
        do {
            cvdata = try Data(contentsOf: url)
            cvName = "cv_file." + url.pathExtension
            cvComment.text = "CV added: save to upload."
            cvRemoveButtonWidthConstraint.constant = 25
        } catch {
            print("error")
        }
    }
    
    @IBAction func pitchHelpAction(_ sender: Any) {
        PopupController.showGray("Tips on how to record your pitch will be placed here.", ok: "Close")
    }
    
    @IBAction func pitchRecordAction(_ sender: Any) {
        
        if jobSeeker?.getPitch() == nil {
            PopupController.showGreen("Here you can record your 30 second pitch. The 30 sec. video will be viewed by prospective employers.", ok: "OK", okCallback: {
                self.showCamera()
            }, cancel: nil, cancelCallback: nil)
        } else {
            showCamera()
        }
    }
    
    func showCamera() {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Camera") as! CameraController
        controller.complete = { (videoUrl) in
            self.videoUrl = videoUrl
            self.playButtonView.isHidden = false
        }
        present(controller, animated: true, completion: nil)
    }
    
    @IBAction func pitchPlayAction(_ sender: Any) {
        
        var url = videoUrl
        
        if url == nil {
            if let video = jobSeeker.getPitch()?.video {
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
        
        if loadingView != nil || !valid() {
            return
        }
        
        if !tickBox.isOn {
            PopupController.showGray("You must check the box confirming the truth of the information you have provided.", ok: "OK")
            return
        }
        
        if jobSeeker == nil {
            jobSeeker = JobSeeker()
        }
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
            let sexName = selectedSexNames[0]
            for sex in AppData.sexes as! [Sex] {
                if sexName == sex.name {
                    jobSeeker.sex = sex.id
                    break
                }
            }
        }
        
        if selectedNationalityNames.count > 0 {
            let nationalityName = selectedNationalityNames[0]
            for nationality in AppData.nationalities as! [Nationality] {
                if nationalityName == nationality.name {
                    jobSeeker.nationality = nationality.id
                    break
                }
            }
        }
        
        if (nationalNumber.text?.isEmpty == false) {
            jobSeeker.national_insurance_number = nationalNumber.text
        } else {
            jobSeeker.national_insurance_number = nil
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
        jobSeeker.cv = cvName
        
        showLoading()
        
        API.shared().saveJobSeeker(jobSeeker: jobSeeker, cvdata: cvdata,
                                   progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                    let rate = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
                                    if rate < 1 {
                                        if self.loadingView.progressView == nil {
                                            self.loadingView.showProgressBar("Uploading CV...")
                                        }
                                        self.loadingView.progressView.progress = rate
                                    }
                                   },
                                   success: { (data) in
                                    
            self.jobSeeker = data as! JobSeeker
            self.cvViewButtonHeightConstraint.constant = self.jobSeeker.cv != nil ? 50 : 0
            AppData.user.jobSeeker = self.jobSeeker.id
            AppData.existProfile = self.jobSeeker.profile != nil
            
            if self.videoUrl != nil {
                
                self.loadingView.showLoadingIcon("")
                
                PitchUploader().uploadVideo(videoUrl: self.videoUrl, complete: { (pitch) in
                    self.hideLoading()
                    self.videoUrl = nil
                    self.saveCompleted()
                }) { (progress) in
                    if progress < 1 {
                        if self.loadingView.progressView == nil {
                            self.loadingView.showProgressBar("Uploading Pitch...")
                        }
                        self.loadingView.progressView.progress = progress
                    } else {
                        self.loadingView.showLoadingIcon("")
                    }
                }
                
            } else {
                self.saveCompleted()
            }
            
        }, failure: self.handleErrors)
        
    }
    
    func saveCompleted() {
        if cvdata != nil {
            cvdata = nil
            cvComment.text = "CV added"
            cvRemoveButtonWidthConstraint.constant = 0
        } else {
            cvComment.text = ""
        }
        
        hideLoading()
        PopupController.showGreen("Success!", ok: "OK", okCallback: {
            if !AppData.existProfile {
                SideMenuController.pushController(id: "job_profile")
            }
        }, cancel: nil, cancelCallback: nil)
    }
        
}

extension JobSeekerProfileController: UIImagePickerControllerDelegate {
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        
        let image = info[UIImagePickerControllerOriginalImage] as! UIImage
        let refUrl = info[UIImagePickerControllerReferenceURL] as? URL
        if refUrl == nil {
            UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
        }
        
        cvdata = UIImagePNGRepresentation(image)
        cvName = "cv_file.jpg"
        cvComment.text = "CV added: save to upload."
        cvRemoveButtonWidthConstraint.constant = 25
        
        ipc.dismiss(animated: true, completion: nil)
    }
}

extension JobSeekerProfileController: UINavigationControllerDelegate {
}

