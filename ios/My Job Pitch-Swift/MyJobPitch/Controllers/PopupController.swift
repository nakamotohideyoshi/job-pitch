//
//  PopupController.swift
//  MyJobPitch
//
//  Created by dev on 12/21/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import STPopup

class PopupController: UIViewController {

    @IBOutlet weak var boardView: UIView!
    @IBOutlet weak var messageLabel: UILabel!
    @IBOutlet weak var okButton: GreenButton!
    @IBOutlet weak var cancelButton: GreyButton!
    
    var okCallback: (() -> Void)!
    var cancelCallback: (() -> Void)!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        self.contentSizeInPopup = UIScreen.main.bounds.size
    }
    
    @IBAction func okAction(_ sender: Any) {
        popupController?.dismiss()
        if okCallback != nil {
            okCallback()
        }
    }
    
    @IBAction func cancelAction(_ sender: Any) {
        popupController?.dismiss()
        if cancelCallback != nil {
            cancelCallback()
        }
    }
    
    static func showGreen(_ message: String!,
                     ok: String!, okCallback: (() -> Void)!,
                     cancel: String!, cancelCallback: (() -> Void)!) {
        let popupController = show(AppHelper.getFrontController(),
                                   message: message,
                                   ok: ok, okCallback: okCallback,
                                   cancel: cancel, cancelCallback: cancelCallback)
        popupController.okButton?.backgroundColor = AppData.greenColor
    }

    static func showYellow(_ message: String!,
                     ok: String!, okCallback: (() -> Void)!,
                     cancel: String!, cancelCallback: (() -> Void)!) {
        let popupController = show(AppHelper.getFrontController(),
                                   message: message,
                                   ok: ok, okCallback: okCallback,
                                   cancel: cancel, cancelCallback: cancelCallback)
        popupController.okButton?.backgroundColor = AppData.yellowColor
    }
    
    static func showGray(_ message: String!, ok: String!) {
        let _ = show(AppHelper.getFrontController(),
                     message: message,
                     ok: nil, okCallback: nil,
                     cancel: ok, cancelCallback: nil)
    }
    
    static func show(_ rootController: UIViewController,
                     message: String!,
                     ok: String!, okCallback: (() -> Void)!,
                     cancel: String!, cancelCallback: (() -> Void)!) -> PopupController {
        
        AppHelper.hideLoading()
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Popup") as! PopupController
        let popupController = STPopupController(rootViewController: controller)
        popupController.backgroundView?.backgroundColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.65)
        popupController.containerView.backgroundColor = UIColor.clear
        popupController.navigationBarHidden = true
        popupController.transitionStyle = STPopupTransitionStyle.fade
        popupController.present(in: rootController)
        
        controller.boardView.layer.cornerRadius = AppData.cornerRadius
        controller.messageLabel.text = message
        
        controller.boardView.backgroundColor = UIColor(red: 35/255.0, green: 35/255.0, blue: 35/255.0, alpha: 0.95)
        controller.boardView.layer.borderColor = UIColor(red: 1, green: 1, blue: 1, alpha: 0.3).cgColor
        controller.boardView.layer.borderWidth = 0.5
        
        if ok != nil {
            controller.okButton.setTitle(ok, for: .normal)
            controller.okCallback = okCallback
        } else {
            controller.okButton.removeFromSuperview()
        }
        
        if cancel != nil {
            controller.cancelButton.setTitle(cancel, for: .normal)
            controller.cancelCallback = cancelCallback
        } else {
            controller.cancelButton.removeFromSuperview()
        }
        
        return controller
        
    }
    
}
