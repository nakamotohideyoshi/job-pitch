//
//  JobEditController.swift
//  MyJobPitch
//
//  Created by dev on 12/13/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

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
    @IBOutlet weak var addImageButton: UIButton!
    @IBOutlet weak var removeImageButton: UIButton!
    
    var location: Location!
    var job: Job!
    var savedJob: ((Job) -> Void)!
    
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

        // Do any additional setup after loading the view.
        
        imagePicker = UIImagePickerController()
        imagePicker.delegate = self
        
        // sector data
        
        for sector in AppData.sectors as! [Sector] {
            sectorNames.append(sector.name)
        }
        sectorField.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.sectorNames,
                                          selectedItems: self.selectedSectorNames,
                                          multiSelection: false,
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
                                          doneCallback: { (items) in
                                            self.selectedHoursNames = items
                                            self.hoursField.text = items.joined(separator: ", ")
            })
        }

        // load job
        
        if job == nil {
            
            navigationItem.title = "Add Job"
            
        } else {
            
            navigationItem.title = "Edit Job"
            
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
            
            if let image = job.getImage() {
                AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
                
                if job.images != nil && job.images.count > 0 {
                    origImage = image
                }
                
                addImageButton.isHidden = origImage != nil
                removeImageButton.isHidden = origImage == nil
            }
            
        }
        
        if removeImageButton.isHidden {
            
            if let image = location?.getImage() {
                AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
            } else {
                imgView.image = UIImage(named: "default-logo")
            }
            
            imgView.alpha = 0.2
            
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
    
    @IBAction func addImageAction(_ sender: Any) {
        
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
        
        let dropboxAction = UIAlertAction(title: "Dropbox", style: .default) { (_) in
            let browser = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "DropboxBrowser") as! DropboxBrowserViewController
            browser.rootViewDelegate = self
            let navController = UINavigationController(rootViewController: browser)
            AppHelper.getFrontController().present(navController, animated: true, completion: nil)
        }
        actionSheetContoller.addAction(dropboxAction)
        
        let cancelAction = UIAlertAction(title: "Cancel", style: .cancel, handler: nil)
        actionSheetContoller.addAction(cancelAction)
        
        present(actionSheetContoller, animated: true, completion: nil)
        
    }
    
    @IBAction func removeImageAction(_ sender: Any) {
        
        logoImage = nil
        if let image = location?.getImage() {
            AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        imgView.alpha = 0.2
        addImageButton.isHidden = false
        removeImageButton.isHidden = true
        
    }
    
    @IBAction func saveAction(_ sender: Any) {
        
        if !valid() {
            return
        }
        
        AppHelper.showLoading("Saving...")
        
        let newJob = Job()
        newJob.location = location.id
        newJob.id = job?.id

        let statusName = active.isOn ? JobStatus.JOB_STATUS_OPEN : JobStatus.JOB_STATUS_CLOSED
        for status in AppData.jobStatuses as! [JobStatus] {
            if status.name == statusName {
                newJob.status = status.id
                break
            }
        }
        
        newJob.title = titleField.text
        newJob.desc = descTextView.text
        
        // sector data
        
        for sector in AppData.sectors as! [Sector] {
            if selectedSectorNames.contains(sector.name) {
                newJob.sector = sector.id
                break
            }
        }
        
        // contract data
        
        for contract in AppData.contracts as! [Contract] {
            if selectedContractNames.contains(contract.name) {
                newJob.contract = contract.id
                break
            }
        }
        
        // hours data
        
        for hours in AppData.hours as! [Hours] {
            if selectedHoursNames.contains(hours.name) {
                newJob.hours = hours.id
                break
            }
        }
        
        API.shared().saveJob(job: newJob, success: { (data) in
            
            self.job = data as! Job
            
            if self.origImage?.id != nil && self.removeImageButton.isHidden {
                
                API.shared().deleteImage(id: (self.origImage?.id)!, endpoint: "user-job-images", success: {
                    self.saveLogoImage()
                }) { (message, errors) in
                    self.handleErrors(message: message, errors: errors)
                }
                
            } else {
                self.saveLogoImage()
            }
            
        }) { (message, errors) in
            self.handleErrors(message: message, errors: errors)
        }
        
    }
    
    func saveLogoImage() {
        
        if logoImage != nil {
            
            let hud = AppHelper.createLoading()
            hud.mode = .determinateHorizontalBar
            hud.label.text = "Uploading..."
            
            API.shared().uploadImage(image: logoImage,
                                     endpoint: "user-job-images",
                                     objectKey: "job",
                                     objectId: self.job.id,
                                     order: 0,
                                     progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                        DispatchQueue.main.async {
                                            hud.progress = Float(totalBytesWritten / totalBytesExpectedToWrite)
                                        }
            }, success: { (data) in
                AppHelper.hideLoading()
                self.job.images = [data as Image]
                _ = self.navigationController?.popViewController(animated: true)
                self.savedJob?(self.job)
            }) { (message, errors) in
                self.handleErrors(message: message, errors: errors)
            }
            
        } else {
            _ = navigationController?.popViewController(animated: true)
            savedJob?(job)
        }
        
    }
    
    static func pushController(location: Location!, job: Job!, callback: ((Job)->Void)!) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobEdit") as! JobEditController
        controller.location = location
        controller.job = job
        controller.savedJob = callback
        AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
    }

}

extension JobEditController: UIImagePickerControllerDelegate {
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        
        logoImage = info[UIImagePickerControllerOriginalImage] as? UIImage
        
        imgView.image = logoImage
        imgView.alpha = 1
        removeImageButton.isHidden = false
        addImageButton.isHidden = true
        
        dismiss(animated: true, completion: nil)
        
    }
    
}

extension JobEditController: UINavigationControllerDelegate {
}

extension JobEditController: DropboxBrowserDelegate {
    
    func dropboxBrowser(_ browser: DropboxBrowserViewController!, didDownloadFile fileName: String!, didOverwriteFile isLocalFileOverwritten: Bool) {
        
        let url = URL(fileURLWithPath: browser.downloadedFilePath)
        do {
            let data = try Data(contentsOf: url)
            logoImage = UIImage(data: data)
            
            if logoImage == nil {
                //PopupController.showGray(fileName + "is not a image file", ok: "OK")
            } else {
                imgView.image = logoImage
                imgView.alpha = 1
                removeImageButton.isHidden = false
                addImageButton.isHidden = true
            }
            
        } catch {
            print("error")
        }
        
        browser.removeDropboxBrowser()
    }
    
}

