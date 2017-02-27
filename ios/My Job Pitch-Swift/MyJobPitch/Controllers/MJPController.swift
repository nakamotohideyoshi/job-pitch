//
//  MJPController.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

protocol ChooseDelegate {
        
    func apply()
    func remove()
    
}

class MJPController: UIViewController {
    
    @IBOutlet weak var scrollView: UIScrollView!
    
    var showKeyboard = false

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(keyboardWasShown),
                                               name: Notification.Name.UIKeyboardDidShow,
                                               object: nil)
        
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(keyboardWillBeHidden),
                                               name: Notification.Name.UIKeyboardWillHide,
                                               object: nil)
        
        let tap = UITapGestureRecognizer.init(target: self, action: #selector(dismissKeyboard))
        tap.delegate = self
        view.addGestureRecognizer(tap)
        
    }
    
    func keyboardWasShown(_ notification: NSNotification) {
        
        showKeyboard = true
        
        if scrollView != nil {
            let bottom_h = AppHelper.getFrontController().view.frame.size.height - view.frame.origin.y - view.frame.size.height
            let info = notification.userInfo
            let size = (info?[UIKeyboardFrameBeginUserInfoKey] as! NSValue).cgRectValue.size
            let contentInsets = UIEdgeInsets(top: 0, left: 0, bottom: size.height - bottom_h, right: 0)
            scrollView.contentInset = contentInsets
            scrollView.scrollIndicatorInsets = contentInsets
        }
    }
    
    func keyboardWillBeHidden(_ notification: NSNotification) {
        showKeyboard = false
        
        if scrollView != nil {
            let contentInsets = UIEdgeInsets.zero
            scrollView.contentInset = contentInsets
            scrollView.scrollIndicatorInsets = contentInsets
        }
    }
    
    func dismissKeyboard() {
        view.endEditing(true)
    }
    
    
    func getRequiredFields() -> [String: NSArray] {
        return [String: NSArray]()
    }
    
    func valid() -> Bool {
        
        view.endEditing(true)
        
        let errors = NSMutableDictionary()
        let requiredFields = getRequiredFields()
        
        for (key, fields) in requiredFields {
            if let field = fields.firstObject {
                var str = ""
                if let tf = field as? UITextField {
                    str = tf.text!
                } else if let tv = field as? UITextView {
                    str = tv.text!
                }
                if str.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    errors[key] = ["This field is required."]
                }
            }
        }
        
        handleErrors(message: nil, errors: errors)
        
        return errors.count == 0
        
    }
    
    func handleErrors(message: String!, errors: NSDictionary!) {
        
        AppHelper.hideLoading()
        
        let requiredFields = getRequiredFields()
        
        for (_, fields) in requiredFields {
            let label = fields.lastObject as! UILabel
            label.text = ""
        }
        
        if errors != nil {
            for (key, errorMessages) in errors {
                
                var errorMessage: String!
                if let msg = errorMessages as? String {
                    errorMessage = msg
                } else if let arr = errorMessages as? NSArray {
                    errorMessage = arr.firstObject as! String
                }
                
                if errorMessage == nil {
                    errorMessage = key as! String
                }
                
                if let fields = requiredFields[key as! String] {
                    (fields.lastObject as! UILabel).text = errorMessage
                } else {
                    PopupController.showGreen(errorMessage,
                                              ok: nil, okCallback: nil,
                                              cancel: "OK", cancelCallback: nil)
                    return
                }
            }
        } else {
            if message != nil {
                PopupController.showGreen(message,
                                          ok: nil, okCallback: nil,
                                          cancel: "OK", cancelCallback: nil)
            }
        }
        
    }
    
}

extension MJPController: UIGestureRecognizerDelegate {
    
    func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
        return showKeyboard
    }
    
}
