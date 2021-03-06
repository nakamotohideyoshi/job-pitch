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
    @IBOutlet weak var logoView: UIImageView!
    @IBOutlet weak var playButtonView: UIView!
    @IBOutlet weak var requirePitch: UISwitch!
    @IBOutlet weak var requireCV: UISwitch!
    
    public var workplace: Location!
    public var job: Job!
    public var saveComplete: ((Job) -> Void)?
    
    var logoPicker: ImagePicker!
    var logoImage: UIImage!

    var sectorNames = [String]()
    var selectedSectorNames = [String]()
    
    var contractNames = [String]()
    var selectedContractNames = [String]()
    
    var hoursNames = [String]()
    var selectedHoursNames = [String]()
    
    var videoUrl: URL!
    
    var addMode = false
    var isNew = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        isModal = true
        
        addMode = SideMenuController.currentID != "businesses"

        logoPicker = ImagePicker()
        logoPicker.delegate = self
        
        // sector data
        
        sectorNames = AppData.sectors.map { $0.name }
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
        
        contractNames = AppData.contracts.map { $0.name }
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
            isNew = true
            
            navigationItem.title = NSLocalizedString("Add Job", comment: "")
            navigationItem.rightBarButtonItem = nil
            logoView.image = UIImage(named: "default-logo")
            
        } else {
            
            navigationItem.title = NSLocalizedString("Edit Job", comment: "")
            
            workplace = job.locationData
            
            active.isOn = job.status == JobStatus.JOB_STATUS_OPEN_ID
            
            titleField.text = job.title
            descTextView.text = job.desc
            
            selectedSectorNames = (AppData.sectors.filter { $0.id == job.sector }).map { $0.name }
            sectorField.text = selectedSectorNames.joined(separator: ", ")
            
            // contract data
            
            selectedContractNames = (AppData.contracts.filter { $0.id == job.contract }).map { $0.name }
            contractField.text = selectedContractNames.joined(separator: ", ")
            
            // hours data
            
            selectedHoursNames = (AppData.hours.filter { $0.id == job.hours }).map { $0.name }
            hoursField.text = selectedHoursNames.joined(separator: ", ")
            
            playButtonView.isHidden = job.getPitch()?.video == nil
            
            AppHelper.loadLogo(job, imageView: logoView, completion: nil)
            
            requirePitch.isOn = job.requiresPitch
            requireCV.isOn = job.requiresCV
        }
        
    }
    
    override func getRequiredFields() -> [String: (UIView, UILabel)] {
        return [
            "title":        (titleField,    titleError),
            "description":  (descTextView,  descError),
            "sector":       (sectorField,   sectorError),
            "contract":     (contractField, contractError),
            "hours":        (hoursField,    hoursError)
        ]
    }
    
    @IBAction func onActivate(_ sender: Any) {
        if !self.active.isOn {
            PopupController.showGreen(NSLocalizedString("Your job posting will not be visible for jobseekers and will not be able to apply or message you for this job.", comment: ""),
                                      ok: NSLocalizedString("Deactivate", comment: ""), okCallback: {
            }, cancel: NSLocalizedString("Cancel", comment: ""), cancelCallback: {
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
        PopupController.showGray(NSLocalizedString("In a competative job market, job seekers would like know what kind of workplace they will be working in.\nUse a video pitch to showcase why your business is a great place to work, and why great candidates should choose this role.", comment: ""),
                                 ok: NSLocalizedString("Close", comment: ""))
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
            job.location = workplace.id
        }
        
        job.status = active.isOn ? JobStatus.JOB_STATUS_OPEN_ID : JobStatus.JOB_STATUS_CLOSED_ID
        job.title = titleField.text
        job.desc = descTextView.text
        
        // sector data
        
        job.sector = AppData.getIdByName(AppData.sectors, name: selectedSectorNames[0])
        
        // contract data
        
        job.contract = AppData.getIdByName(AppData.contracts, name: selectedContractNames[0])
        
        // hours data

        job.hours = AppData.getIdByName(AppData.hours, name: selectedHoursNames[0])
        
        job.requiresPitch = requirePitch.isOn
        job.requiresCV = requirePitch.isOn
        
        showLoading()
        
        API.shared().saveJob(job) { (result, error) in
            
            if error != nil {
                self.handleError(error)
                return
            }
            
            self.job = result as! Job
            
            if self.logoImage != nil {
                
                self.showLoading(NSLocalizedString("Uploading...", comment: ""))
                
                API.shared().uploadImage(self.logoImage,
                                         endpoint: "user-job-images",
                                         objectKey: "job",
                                         objectId: self.job.id,
                                         order: 0,
                                         progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                            self.showLoading(NSLocalizedString("Uploading...", comment: ""), withProgress: Float(totalBytesWritten) / Float(totalBytesExpectedToWrite))
                }) { (_, error) in
                    if error == nil {
                        self.uploadPitch()
                    } else {
                        self.handleError(error)
                    }
                }
            } else {
                self.uploadPitch()
            }
        }
    }
    
    func uploadPitch() {
        if videoUrl == nil {
            saveFinished();
            return;
        }
        
        showLoading()
        
        let jsPitch = JobPitchForCreation()
        jsPitch.job = job.id

        API.shared().saveJobPitch(jsPitch) { (result, error) in
            if error != nil {
                self.handleError(error)
                return
            }

            PitchUploader().uploadVideo(self.videoUrl, pitch: result as! Pitch, endpoint: "job-videos", progress: { (progress) in
                if progress < 1 {
                    self.showLoading(NSLocalizedString("Uploading Pitch...", comment: ""), withProgress: progress)
                } else {
                    self.showLoading()
                }
            }) { pitch in
                if pitch == nil {
                    self.handleError(error)
                } else {
                    self.saveFinished()
                }                
            }
        }
    }
    
    func saveFinished() {
        
        AppData.updateJob(job.id) { (result, error) in
            
            if error != nil {
                self.handleError(error)
                return
            }
        
            if self.isNew && UserDefaults.standard.integer(forKey: "tutorial") == 2 {
                UserDefaults.standard.removeObject(forKey: "tutorial")
                UserDefaults.standard.synchronize()
            }
            
            self.closeController()
            self.saveComplete?(result!)
        }        
    }
    
    static func instantiate() -> JobEditController {
        return AppHelper.instantiate("JobEdit") as! JobEditController
    }    
}

extension JobEditController: ImagePickerDelegate {
    
    func imageSelected(_ picker: ImagePicker, image: UIImage) {
        logoImage = image
        logoView.image = image
    }
}
