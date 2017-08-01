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
    @IBOutlet weak var addLogoButton: UIButton!
    @IBOutlet weak var removeImageButton: UIButton!
    
    var isAddMode = false
    var isNew = false
    
    var location: Location!
    var job: Job!
    
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
            isNew = true
            load()
        } else {
            navigationItem.title = "Edit Job"
            
            AppHelper.showLoading("Loading...")
            API.shared().loadJob(id: job.id, success: { (data) in
                AppHelper.hideLoading()
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
            
            if let image = job.getImage() {
                AppHelper.loadImageURL(imageUrl: (image.image)!, imageView: imgView, completion: nil)
                if job.images != nil && job.images.count > 0 {
                    origImage = image
                    removeImageButton.isHidden = false
                    addLogoButton.setTitle("Change Logo", for: .normal)
                }
            } else {
                imgView.image = UIImage(named: "default-logo")
            }
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
        
        present(actionSheetContoller, animated: true, completion: nil)
        
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
        if let image = location?.getImage() {
            AppHelper.loadImageURL(imageUrl: (image.thumbnail)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        removeImageButton.isHidden = true
        addLogoButton.setTitle("Add Logo", for: .normal)
        
    }
    
    @IBAction func saveAction(_ sender: Any) {
        
        if !valid() {
            return
        }
        
        AppHelper.showLoading("Saving...")
        
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
        
        API.shared().saveJob(job: job, success: { (data) in
            
            if self.logoImage != nil {
                
                let hud = AppHelper.createLoading()
                hud.mode = .determinateHorizontalBar
                hud.label.text = "Uploading..."
                
                API.shared().uploadImage(image: self.logoImage,
                                         endpoint: "user-job-images",
                                         objectKey: "job",
                                         objectId: self.job.id,
                                         order: 0,
                                         progress: { (bytesWriteen, totalBytesWritten, totalBytesExpectedToWrite) in
                                            hud.progress = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
                }, success: { (data) in
                    self.saveFinished()
                }, failure: self.handleErrors)
                
            } else if self.origImage?.id != nil && self.removeImageButton.isHidden {
                
                API.shared().deleteImage(id: (self.origImage?.id)!, endpoint: "user-job-images", success: {
                    self.saveFinished()
                }, failure: self.handleErrors)
                
            } else {
                self.saveFinished()
            }
            
        }, failure: self.handleErrors)
        
    }
    
    func saveFinished() {
        AppHelper.hideLoading()
        
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
