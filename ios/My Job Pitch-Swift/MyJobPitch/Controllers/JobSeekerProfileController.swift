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
    @IBOutlet weak var mobile: UITextField!
    @IBOutlet weak var mobilePublic: UISwitch!
    @IBOutlet weak var age: UITextField!
    @IBOutlet weak var agePublic: UISwitch!
    @IBOutlet weak var sex: ButtonTextField!
    @IBOutlet weak var sexPublic: UISwitch!
    @IBOutlet weak var nationality: ButtonTextField!
    @IBOutlet weak var nationalityPublic: UISwitch!
    @IBOutlet weak var descView: UITextView!
    @IBOutlet weak var descError: UILabel!
    @IBOutlet weak var cvFileName: UILabel!
    @IBOutlet weak var cvRemoveButton: UIButton!
    @IBOutlet weak var hasReferences: UISwitch!
    @IBOutlet weak var tickBox: UISwitch!
    @IBOutlet weak var playButtonView: UIView!
    @IBOutlet weak var cvViewButtonHeightConstraint: NSLayoutConstraint!
    
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

        // load sex data
        
        for sex in AppData.sexes as! [Sex] {
            sexNames.append(sex.name)
        }
        sex.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.sexNames,
                                          selectedItems: self.selectedSexNames,
                                          multiSelection: false,
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
                                          doneCallback: { (items) in
                                            self.selectedNationalityNames = items
                                            self.nationality.text = items.joined(separator: ", ")
            })
        }
        
        // load jobseeker data
        
        if (AppData.user.jobSeeker != nil) {
            AppHelper.showLoading("Loading...")
            API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
                AppHelper.hideLoading()
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
            "firstName": [firstName, firstNameError],
            "lastName": [lastName, lastNameError],
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
        UIApplication.shared.openURL(URL(string: jobSeeker.cv)!)
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
        
        let dropboxAction = UIAlertAction(title: "Dropbox", style: .default) { (_) in
            let browser = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "DropboxBrowser") as! DropboxBrowserViewController
            browser.rootViewDelegate = self
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
        cvFileName.text = ""
        cvRemoveButton.isHidden = true
    }
    
    @IBAction func pitchHelpAction(_ sender: Any) {
        PopupController.showGray("Tips on how to record your pitch will be placed here.", ok: "Close")
    }
    
    @IBAction func pitchRecordAction(_ sender: Any) {
        
        if jobSeeker.getPitch() == nil {
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
        
        if !valid() {
            return
        }
        
        if !tickBox.isOn {
            PopupController.showGray("The information provided should be guaranteed to be truthful to the best.", ok: "OK")
            return
        }
        
        if jobSeeker == nil {
            jobSeeker = JobSeeker()
        }
        jobSeeker.active = active.isOn
        jobSeeker.firstName = firstName.text?.capitalized
        jobSeeker.lastName = lastName.text?.capitalized
        jobSeeker.email = AppData.email
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
        
        jobSeeker.emailPublic = emailPublic.isOn
        jobSeeker.mobilePublic = mobilePublic.isOn
        jobSeeker.agePublic = agePublic.isOn
        jobSeeker.sexPublic = sexPublic.isOn
        jobSeeker.nationalityPublic = nationalityPublic.isOn
        jobSeeker.desc = descView.text
        jobSeeker.hasReferences = hasReferences.isOn
        jobSeeker.truthConfirmation = tickBox.isOn
        jobSeeker.cv = cvName
        
        let hud = AppHelper.createLoading()
        if cvdata != nil {
            hud.mode = .determinateHorizontalBar
        }
        hud.label.text = "Saving..."
        
        API.shared().saveJobSeeker(jobSeeker: jobSeeker, cvdata: cvdata,
                                   progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                        hud.progress = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
                                   },
                                   success: { (data) in
                                    
            self.jobSeeker = data as! JobSeeker
            self.cvViewButtonHeightConstraint.constant = self.jobSeeker.cv != nil ? 50 : 0
            AppData.user.jobSeeker = self.jobSeeker.id
            AppData.existProfile = self.jobSeeker.profile != nil
            
            if self.videoUrl != nil {
                PitchController.uploadVideo(videoUrl: self.videoUrl, complete: { (pitch) in
                    if pitch != nil {
                        self.videoUrl = nil
                        self.saveCompleted()
                    }
                })
            } else {
                self.saveCompleted()
            }
            
        }, failure: self.handleErrors)
        
    }
    
    func saveCompleted() {
        PopupController.showGreen("Success!", ok: "OK", okCallback: {
            if self.jobSeeker.profile == nil {
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
        cvName = "cv.jpg"
        cvFileName.text = "CV added, save to upload."
        cvRemoveButton.isHidden = false
        
        ipc.dismiss(animated: true, completion: nil)
    }
}

extension JobSeekerProfileController: UINavigationControllerDelegate {
}

extension JobSeekerProfileController: DropboxBrowserDelegate {
    
    func dropboxBrowser(_ browser: DropboxBrowserViewController!, didDownloadFile fileName: String!, didOverwriteFile isLocalFileOverwritten: Bool) {
        
        let url = URL(fileURLWithPath: browser.downloadedFilePath)
        do {
            cvdata = try Data(contentsOf: url)
            cvName = fileName
            cvFileName.text = "CV added, save to upload."
            cvRemoveButton.isHidden = false
        } catch {
            print("error")
        }
        
        browser.removeDropboxBrowser()
    }
    
}
