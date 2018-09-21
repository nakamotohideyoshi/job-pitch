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
    @IBOutlet weak var requirePitch: UISwitch!
    @IBOutlet weak var requireCV: UISwitch!
    
    var isAddMode = false
    var isNew = false
    
    var location: Location!
    var job: Job!
    
    var videoUrl: URL!
    
    var logoPicker: ImagePicker!
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

        logoPicker = ImagePicker()
        logoPicker.delegate = self
        
        //imgView.addDotBorder(dotWidth: 4, color: UIColor.black)
        
        // sector data
        
        for sector in AppData.sectors {
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
        
        for contract in AppData.contracts {
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
        hoursNames = AppData.hours.map { $0.name }
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
            
            for status in AppData.jobStatuses {
                if status.id == job.status {
                    active.isOn = status.name == JobStatus.JOB_STATUS_OPEN
                    break
                }
            }
            
            titleField.text = job.title
            descTextView.text = job.desc
            
            for sector in AppData.sectors {
                if job.sector == sector.id {
                    selectedSectorNames.append(sector.name)
                    break
                }
            }
            sectorField.text = selectedSectorNames.joined(separator: ", ")
            
            // contract data
            
            for contract in AppData.contracts {
                if job.contract == contract.id {
                    selectedContractNames.append(contract.name)
                    break
                }
            }
            contractField.text = selectedSectorNames.joined(separator: ", ")
            
            // hours data
            
            selectedHoursNames = (AppData.hours.filter { $0.id ==  job.hours }).map { $0.name }
            hoursField.text = selectedHoursNames.joined(separator: ", ")
            
            playButtonView.isHidden = job.getPitch()?.video == nil
            
            AppHelper.loadLogo(job, imageView: imgView, completion: { 
                if self.job.images != nil && self.job.images.count > 0 {
                    self.origImage = self.job.getImage()
                    self.removeImageButton.isHidden = false
                    self.addLogoButton.setTitle("Change Logo", for: .normal)
                }
            })
            
            requirePitch.isOn = job.requiresPitch
            requireCV.isOn = job.requiresCV
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
        logoPicker.present(self, target: sender as! UIView)
    }
    
    @IBAction func pitchHelpAction(_ sender: Any) {
        PopupController.showGray("In a competative job market, job seekers would like know what kind of workplace they will be working in.\nUse a video pitch to showcase why your business is a great place to work, and why great candidates should choose this role.", ok: "Close")
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
    
    @IBAction func removeImageAction(_ sender: Any) {
        
        logoImage = nil
        AppHelper.loadLogo(location, imageView: imgView, completion: nil)
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
        
        if !valid() {
            return
        }
        
        if job == nil {
            job = Job()
            job.location = location.id
        }
        
        let statusName = active.isOn ? JobStatus.JOB_STATUS_OPEN : JobStatus.JOB_STATUS_CLOSED
        for status in AppData.jobStatuses {
            if status.name == statusName {
                job.status = status.id
                break
            }
        }
        
        job.title = titleField.text
        job.desc = descTextView.text
        
        // sector data
        
        for sector in AppData.sectors {
            if selectedSectorNames.contains(sector.name) {
                job.sector = sector.id
                break
            }
        }
        
        // contract data
        
        for contract in AppData.contracts {
            if selectedContractNames.contains(contract.name) {
                job.contract = contract.id
                break
            }
        }
        
        // hours data
        
        for hours in AppData.hours {
            if selectedHoursNames.contains(hours.name) {
                job.hours = hours.id
                break
            }
        }
        
        job.requiresPitch = requirePitch.isOn
        job.requiresCV = requirePitch.isOn
        
        showLoading()
        
        API.shared().saveJob(job: job, success: { (data) in
            
            if self.logoImage != nil {
                
                self.showLoading(label: "Uploading...")
                
                API.shared().uploadImage(image: self.logoImage,
                                         endpoint: "user-job-images",
                                         objectKey: "job",
                                         objectId: self.job.id,
                                         order: 0,
                                         progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                            self.showLoading(label: "Uploading...", withProgress: Float(totalBytesWritten) / Float(totalBytesExpectedToWrite))
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
        
        self.showLoading()
        
        JobPitchUploader().uploadVideo(videoUrl: self.videoUrl, job: job.id, complete: { (pitch) in
            self.saveFinished()
        }) { (progress) in
            print(progress)
            if progress < 1 {
                self.showLoading(label: "Uploading Pitch...", withProgress: progress)
            } else {
                self.showLoading()
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
            let controller = JobDetailController.instantiate()
            controller.job = job
            controllers?.insert(controller, at: (controllers?.count)!-1)
            navigationController?.viewControllers = controllers!
        }
        
        _ = navigationController?.popViewController(animated: true)
        
    }
    
    static func instantiate() -> JobEditController {
        return AppHelper.instantiate("JobEdit") as! JobEditController
    }    
}

extension JobEditController: ImagePickerDelegate {
    
    func imageSelected(_ picker: ImagePicker, image: UIImage) {
        imgView.image = image
        removeImageButton.isHidden = false
        addLogoButton.setTitle("Change Logo", for: .normal)
    }
}
