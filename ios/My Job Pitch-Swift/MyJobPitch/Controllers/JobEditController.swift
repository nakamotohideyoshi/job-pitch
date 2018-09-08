//
//  JobEditController.swift
//  MyJobPitch
//
//  Created by dev on 12/13/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit
import AssetsLibrary
import AVFoundation
import AVKit

class JobEditController: MJPController {

    @IBOutlet weak var active: UISwitch!
    @IBOutlet weak var titleField: UITextField!
    @IBOutlet weak var titleError: UILabel!
    @IBOutlet weak var descTextView: BorderTextView!
    @IBOutlet weak var descError: UILabel!
    @IBOutlet weak var sectorField: ButtonTextField!
    @IBOutlet weak var sectorError: UILabel!
    @IBOutlet weak var contractField: ButtonTextField!
    @IBOutlet weak var contractError: UILabel!
    @IBOutlet weak var hoursField: ButtonTextField!
    @IBOutlet weak var hoursError: UILabel!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var addLogoButton: UIButton!
    @IBOutlet weak var removeImageButton: UIButton!
    @IBOutlet weak var playButtonView: UIView!
    
    var isAddMode = false
    var isNew = false
    
    var location: Location!
    var job: Job!
    
    var videoUrl: URL!
    
    var imagePicker: UIImagePickerController!
    var logoImage: UIImage!

    var sectorNames = [String]()
    var selectedSectorNames = [String]()
    
    var contractNames = [String]()
    var selectedContractNames = [String]()
    
    var hoursNames = [String]()
    var selectedHoursNames = [String]()
    
    var origImage: Image!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        isAddMode = SideMenuController.currentID != "businesses"

        // Do any additional setup after loading the view.
        
        imagePicker = UIImagePickerController()
        imagePicker.delegate = self
        
        //imgView.addDotBorder(dotWidth: 4, color: UIColor.black)
        
        // sector data
        
        for sector in AppData.sectors as! [Sector] {
            sectorNames.append(sector.name)
        }
        sectorField.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.sectorNames,
                                          selectedItems: self.selectedSectorNames,
                                          multiSelection: false,
                                          search: true,
                                          doneCallback: { (items) in
                                            self.selectedSectorNames = items
                                            self.sectorField.text = items.joined(separator: ", ")
            })
        }
        
        // contract data
        
        for contract in AppData.contracts as! [Contract] {
            contractNames.append(contract.name)
        }
        contractField.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.contractNames,
                                          selectedItems: self.selectedContractNames,
                                          multiSelection: false,
                                          search: false,
                                          doneCallback: { (items) in
                                            self.selectedContractNames = items
                                            self.contractField.text = items.joined(separator: ", ")
            })
        }
        
        // hours data
        
        for hours in AppData.hours as! [Hours] {
            hoursNames.append(hours.name)
        }
        hoursField.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.hoursNames,
                                          selectedItems: self.selectedHoursNames,
                                          multiSelection: false,
                                          search: false,
                                          doneCallback: { (items) in
                                            self.selectedHoursNames = items
                                            self.hoursField.text = items.joined(separator: ", ")
            })
        }

        // load job
        
        if job == nil {
            navigationItem.title = "Add Job"
            navigationItem.rightBarButtonItem = nil
            isNew = true
            load()
        } else {
            navigationItem.title = "Edit Job"
            
            showLoading()
            API.shared().loadJob(id: job.id, success: { (data) in
                self.hideLoading()
                self.job = data as! Job
                self.load()
            }, failure: self.handleErrors)
        }
        
    }
    
    func load() {
        
        if job != nil {
            
            location = job.locationData
            
            for status in AppData.jobStatuses as! [JobStatus] {
                if status.id == job.status {
                    active.isOn = status.name == JobStatus.JOB_STATUS_OPEN
                    break
                }
            }
            
            titleField.text = job.title
            descTextView.text = job.desc
            
            for sector in AppData.sectors as! [Sector] {
                if job.sector == sector.id {
                    selectedSectorNames.append(sector.name)
                    break
                }
            }
            sectorField.text = selectedSectorNames.joined(separator: ", ")
            
            // contract data
            
            for contract in AppData.contracts as! [Contract] {
                if job.contract == contract.id {
                    selectedContractNames.append(contract.name)
                    break
                }
            }
            contractField.text = selectedSectorNames.joined(separator: ", ")
            
            // hours data
            
            for hours in AppData.hours as! [Hours] {
                if job.hours == hours.id {
                    selectedHoursNames.append(hours.name)
                    break
                }
            }
            hoursField.text = selectedHoursNames.joined(separator: ", ")
            
            playButtonView.isHidden = job.getPitch()?.video == nil
            
            AppHelper.loadLogo(image: job.getImage(), imageView: imgView, completion: { 
                if self.job.images != nil && self.job.images.count > 0 {
                    self.origImage = self.job.getImage()
                    self.removeImageButton.isHidden = false
                    self.addLogoButton.setTitle("Change Logo", for: .normal)
                }
            })
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        
    }
    
    override func getRequiredFields() -> [String: NSArray] {
        return [
            "title":        [titleField,    titleError],
            "description":  [descTextView,  descError],
            "sector":       [sectorField,   sectorError],
            "contract":     [contractField, contractError],
            "hours":        [hoursField,    hoursError]
        ]
    }
    
    @IBAction func onActivate(_ sender: Any) {
        if !self.active.isOn {
            PopupController.showGreen("Your job posting will not be visible for jobseekers and will not be able to apply or message you for this job.", ok: "Deactivate", okCallback: {
            }, cancel: "Cancel", cancelCallback: {
                self.activateBackUp()
            })
        }
    }
    
    func activateBackUp() {
        self.active.setOn(true, animated: true)
    }
    
    @IBAction func addLogoAction(_ sender: Any) {
        
        let actionSheetContoller = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
        
        let takePhotoAction = UIAlertAction(title: "Take Photo", style: .default) { (_) in
            self.imagePicker.sourceType = .camera
            self.present(self.imagePicker, animated: true, completion: nil)
        }
        actionSheetContoller.addAction(takePhotoAction)
        
        let photoGalleryAction = UIAlertAction(title: "Select Photo", style: .default) { (_) in
            self.imagePicker.sourceType = .photoLibrary
            self.present(self.imagePicker, animated: true, completion: nil)
        }
        actionSheetContoller.addAction(photoGalleryAction)
        
        let googledriveAction = UIAlertAction(title: "Google Drive", style: .default) { (_) in
            let browser = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "GoogleDrive") as! GoogleDriveController
            browser.mimeQuery = "mimeType = 'image/png' or mimeType = 'image/jpg'"
            browser.downloadCallback = { (path) in
                self.downloadedLogo(path: path)
            }
            let navController = UINavigationController(rootViewController: browser)
            AppHelper.getFrontController().present(navController, animated: true, completion: nil)
        }
        actionSheetContoller.addAction(googledriveAction)
        
        let dropboxAction = UIAlertAction(title: "Dropbox", style: .default) { (_) in
            let browser = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Dropbox") as! DropboxController
            browser.downloadCallback = { (path) in
                self.downloadedLogo(path: path)
            }
            let navController = UINavigationController(rootViewController: browser)
            AppHelper.getFrontController().present(navController, animated: true, completion: nil)
        }
        actionSheetContoller.addAction(dropboxAction)
        
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel, handler: nil)
        actionSheetContoller.addAction(cancelAction)
        
        if let popoverController = actionSheetContoller.popoverPresentationController {
            let sourceView = sender as! UIView
            popoverController.sourceView = sourceView
            popoverController.sourceRect = CGRect(x: sourceView.bounds.midX, y: 0, width: 0, height: 0)
            popoverController.permittedArrowDirections = .down
        }
        
        present(actionSheetContoller, animated: true, completion: nil)
        
    }
    
    @IBAction func pitchHelpAction(_ sender: Any) {
        PopupController.showGray("In a competative job market, job seekers would like know what kind of workplace they will be working in.\nUse a video pitch to showcase why your business is a great place to work, and why great candidates should choose this role.", ok: "Close")
    }
    
    @IBAction func pitchRecordAction(_ sender: Any) {
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
            if let video = job.getPitch()?.video {
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
    
    
    func downloadedLogo(path: String) {
        let url = URL(fileURLWithPath: path)
        do {
            let data = try Data(contentsOf: url)
            logoImage = UIImage(data: data)
            
            if logoImage == nil {
                //PopupController.showGray(fileName + "is not a image file", ok: "OK")
            } else {
                imgView.image = logoImage
                removeImageButton.isHidden = false
                addLogoButton.setTitle("Change Logo", for: .normal)
            }
            
        } catch {
            print("error")
        }
    }
    
    @IBAction func removeImageAction(_ sender: Any) {
        
        logoImage = nil
        AppHelper.loadLogo(image: location?.getImage(), imageView: imgView, completion: nil)
        removeImageButton.isHidden = true
        addLogoButton.setTitle("Add Logo", for: .normal)
        
    }
    
    @IBAction func shareAction(_ sender: Any) {
        let url = String(format: "%@/jobseeker/jobs/%d", API.apiRoot.absoluteString, job.id)
        let itemProvider = ShareProvider(placeholderItem: url)
        let controller = UIActivityViewController(activityItems: [itemProvider], applicationActivities: nil)
        present(controller, animated: true, completion: nil)
    }
    
    @IBAction func saveAction(_ sender: Any) {
        
        if loadingView != nil || !valid() {
            return
        }
        
        if job == nil {
            job = Job()
            job.location = location.id
        }
        
        let statusName = active.isOn ? JobStatus.JOB_STATUS_OPEN : JobStatus.JOB_STATUS_CLOSED
        for status in AppData.jobStatuses as! [JobStatus] {
            if status.name == statusName {
                job.status = status.id
                break
            }
        }
        
        job.title = titleField.text
        job.desc = descTextView.text
        
        // sector data
        
        for sector in AppData.sectors as! [Sector] {
            if selectedSectorNames.contains(sector.name) {
                job.sector = sector.id
                break
            }
        }
        
        // contract data
        
        for contract in AppData.contracts as! [Contract] {
            if selectedContractNames.contains(contract.name) {
                job.contract = contract.id
                break
            }
        }
        
        // hours data
        
        for hours in AppData.hours as! [Hours] {
            if selectedHoursNames.contains(hours.name) {
                job.hours = hours.id
                break
            }
        }
        
        showLoading()
        
        API.shared().saveJob(job: job, success: { (data) in
            
            if self.logoImage != nil {
                
                self.loadingView.showProgressBar("Uploading...")
                
                API.shared().uploadImage(image: self.logoImage,
                                         endpoint: "user-job-images",
                                         objectKey: "job",
                                         objectId: self.job.id,
                                         order: 0,
                                         progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                            self.loadingView.progressView.progress = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
                }, success: { (data) in
                    self.uploadPitch()
                }, failure: self.handleErrors)
                
            } else if self.origImage?.id != nil && self.removeImageButton.isHidden {
                
                API.shared().deleteImage(id: (self.origImage?.id)!, endpoint: "user-job-images", success: {
                    self.uploadPitch()
                }, failure: self.handleErrors)
                
            } else {
                self.uploadPitch()
            }
            
        }, failure: self.handleErrors)
        
    }
    
    func uploadPitch() {
        if self.videoUrl == nil {
            self.saveFinished();
            return;
        }
        
        self.loadingView.showLoadingIcon("")
        
        JobPitchUploader().uploadVideo(videoUrl: self.videoUrl, job: job.id, complete: { (pitch) in
            self.saveFinished()
        }) { (progress) in
            print(progress)
            if progress < 1 {
                if self.loadingView.progressView == nil {
                    self.loadingView.showProgressBar("Uploading Pitch...")
                }
                self.loadingView.progressView.progress = progress
            } else {
                self.loadingView.showLoadingIcon("")
            }
        }
    }
    
    func saveFinished() {
        
        if !isNew {
            _ = navigationController?.popViewController(animated: true)
            return
        }
        
        var controllers = navigationController?.viewControllers
        if isAddMode {
            while true {
                if controllers?[(controllers?.count)!-2] is SelectJobController {
                    break
                }
                if controllers?.count == 2 {
                    _ = navigationController?.popViewController(animated: true)
                    return
                }
                controllers?.remove(at: (controllers?.count)!-2)
            }
            navigationController?.viewControllers = controllers!
        } else {
            let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobDetail") as! JobDetailController
            controller.job = job
            controllers?.insert(controller, at: (controllers?.count)!-1)
            navigationController?.viewControllers = controllers!
        }
        
        _ = navigationController?.popViewController(animated: true)
        
    }
    
    static func pushController(location: Location!, job: Job!) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobEdit") as! JobEditController
        controller.location = location
        controller.job = job
        AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
    }

}

extension JobEditController: UIImagePickerControllerDelegate {
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        
        logoImage = info[UIImagePickerControllerOriginalImage] as? UIImage
        
        imgView.image = logoImage
        removeImageButton.isHidden = false
        addLogoButton.setTitle("Change Logo", for: .normal)
        
        dismiss(animated: true, completion: nil)
        
    }
    
}

extension JobEditController: UINavigationControllerDelegate {
}
