//
//  ImagePicker.swift
//  MyJobPitch
//
//  Created by bb on 9/17/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

protocol ImagePickerDelegate {
    func imageSelected(_ picker: ImagePicker, image: UIImage)
}

class ImagePicker: NSObject {

    var picker: UIImagePickerController!
    var delegate: ImagePickerDelegate!
    
    func present(_ controller: UIViewController, target: UIView) {
        let actionSheet = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
        
        let cameraAction = UIAlertAction(title: NSLocalizedString("Take Photo1", comment: ""), style: .default) { (_) in
            self.showImagePicker(controller, type:.camera)
        }
        actionSheet.addAction(cameraAction)
        
        let photoAction = UIAlertAction(title: NSLocalizedString("Photo library", comment: ""), style: .default) { (_) in
            self.showImagePicker(controller, type:.photoLibrary)
        }
        actionSheet.addAction(photoAction)
        
        let googledriveAction = UIAlertAction(title: NSLocalizedString("Google Drive", comment: ""), style: .default) { (_) in
            let browser = GoogleDriveController.instantiate()
            browser.downloadCallback = { (path) in
                self.downloadedImage(path)
            }
            let navController = UINavigationController(rootViewController: browser)
            controller.present(navController, animated: true, completion: nil)
        }
        actionSheet.addAction(googledriveAction)
        
        let dropboxAction = UIAlertAction(title: NSLocalizedString("Dropbox", comment: ""), style: .default) { (_) in
            let browser = GoogleDriveController.instantiate()
            browser.downloadCallback = { (path) in
                self.downloadedImage(path)
            }
            let navController = UINavigationController(rootViewController: browser)
            controller.present(navController, animated: true, completion: nil)
        }
        actionSheet.addAction(dropboxAction)
        
        let cancelAction = UIAlertAction(title: NSLocalizedString("Cancel", comment: ""), style: .cancel, handler: nil)
        actionSheet.addAction(cancelAction)
        
        if let popoverController = actionSheet.popoverPresentationController {
            let sourceView = target
            popoverController.sourceView = sourceView
            popoverController.sourceRect = CGRect(x: sourceView.bounds.midX, y: 0, width: 0, height: 0)
            popoverController.permittedArrowDirections = .down
        }
        
        controller.present(actionSheet, animated: true, completion: nil)
    }
    
    func showImagePicker(_ controller: UIViewController,  type: UIImagePickerControllerSourceType) {
        if UIImagePickerController.isSourceTypeAvailable(type) {
            if picker == nil {
                picker = UIImagePickerController()
                picker.delegate = self
            }
            picker.sourceType = type
            controller.present(picker, animated: true, completion: nil)
        } else {
            PopupController.showGray(NSLocalizedString("You don't have camera.", comment: ""),
                                     ok: NSLocalizedString("Ok", comment: ""))
        }
    }
    
    func downloadedImage(_ path: String) {
        let url = URL(fileURLWithPath: path)
        do {
            let data = try Data(contentsOf: url)
            if let image = UIImage(data: data) {
                delegate.imageSelected(self, image: image)
            } else {
                //PopupController.showGray(fileName + "is not a image file", ok: "OK")
            }
        } catch {
            print("error")
        }
    }

}

extension ImagePicker: UIImagePickerControllerDelegate {
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        
        let image = info[UIImagePickerControllerOriginalImage] as! UIImage
//        let refUrl = info[UIImagePickerControllerReferenceURL] as? URL
//        if refUrl == nil {
//            UIImageWriteToSavedPhotosAlbum(image, nil, nil, nil)
//        }
        
        delegate?.imageSelected(self, image: image)
        
        picker.dismiss(animated: true, completion: nil)
    }
}

extension ImagePicker: UINavigationControllerDelegate {
}
