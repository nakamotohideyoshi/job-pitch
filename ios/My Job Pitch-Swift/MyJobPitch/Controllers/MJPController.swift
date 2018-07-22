//
//  MJPController.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

protocol ChooseDelegate {
        
    func apply(callback: (()->Void)!)
    func remove()
    
}

class MJPController: UIViewController {
    
    @IBOutlet weak var scrollView: UIScrollView!
    
    var showKeyboard = false
    
    var loadingView: LoadingView!
    var allApplications: NSMutableArray!
    
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
        
        self.navigationController?.navigationBar.topItem?.backBarButtonItem = UIBarButtonItem(title: "", style: .plain, target: nil, action: nil)

    }
    
    func showLoading() {
        if loadingView == nil {
            loadingView = LoadingView.create(controller: self)
            navigationItem.leftBarButtonItem?.isEnabled = false
            navigationItem.rightBarButtonItem?.isEnabled = false
        }
    }
    
    func hideLoading() {
        if loadingView != nil {
            loadingView.removeFromSuperview()
            loadingView = nil
            navigationItem.leftBarButtonItem?.isEnabled = true
            navigationItem.rightBarButtonItem?.isEnabled = true
        }
    }
    
    func runTimer() {
        if AppData.timer == nil {
            getNewMesssageCount()
            AppData.timer = Timer.scheduledTimer(timeInterval: 30, target: self, selector: #selector(getNewMesssageCount), userInfo: nil, repeats: true)
        }
    }
    
    func getNewMesssageCount() {
        
        if (AppData.user != nil && AppData.isTimerRunning) {        
            API.shared().loadApplicationsForJob(jobId: nil, status: nil, shortlisted: false, success: { (data) in
                self.allApplications = data.mutableCopy() as! NSMutableArray
                var newMessages: [Message]! = []
                
                var fromRole = 2
                if AppData.user.isJobSeeker() {
                    fromRole = 1
                }
                
                var startMessage: Message! = nil
                var lastMessage: Message! = nil
                
                for item in self.allApplications as! [Application] {
                    let application = item
                    let messages = application.messages as! [Message]
                    
                    if messages.count > 0 {
                        for i in 0...messages.count-1 {
                            let message = messages[messages.count-1-i]
                            if message.fromRole == (fromRole as NSNumber) {
                                if !message.read {
                                    newMessages?.append(message)
                                } else {
                                    if startMessage == nil {
                                        startMessage = message
                                    } else {
                                        if message.created > startMessage!.created {
                                            startMessage = message
                                        }
                                    }
                                    break
                                }
                            }
                        }
                    }
                }
                
                var newMessagesCount = startMessage == nil ? (newMessages?.count)! : 0
                
                if (newMessages != nil) {
                    for i in 0...(newMessages?.count)!-1 {
                        if startMessage != nil {
                            if newMessages![i].created > startMessage.created {
                                newMessagesCount += 1
                                if lastMessage == nil {
                                    lastMessage = newMessages![i]
                                } else {
                                    if newMessages![i].created > lastMessage.created {
                                        lastMessage = newMessages![i]
                                    }
                                }
                            }
                        } else {
                            if lastMessage == nil {
                                lastMessage = newMessages![i]
                            } else {
                                if newMessages![i].created > lastMessage.created {
                                    lastMessage = newMessages![i]
                                }
                            }
                        }
                    }
                }
            
                AppData.lastMessage = lastMessage
                AppData.startMessage = startMessage
                AppData.newMessagesCount = newMessagesCount
                
            }, failure: {(message: String?, errors: NSDictionary?) in
                
            })
        }
    }
    
    func stopTimer() {
        if AppData.timer != nil {
            AppData.timer?.invalidate()
            AppData.timer = nil
        }
    }
    
    // keyboard
    
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
    
    // data input
    
    func getRequiredFields() -> [String: NSArray] {
        return [String: NSArray]()
    }
    
    func valid() -> Bool {
        
        view.endEditing(true)
        
        let errors = NSMutableDictionary()
        let requiredFields = getRequiredFields()
        var firstField: UIView? = nil
        
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
                    if (firstField == nil) {
                        firstField = field as? UIView
                        let frame = (firstField?.frame)!
                        let origin = CGPoint(x: frame.origin.x, y: frame.origin.y - 15)
                        let rect = CGRect(origin: origin, size: frame.size)
                        scrollView.scrollRectToVisible(rect, animated: true);
                    }
                }
            }
        }
        
        handleErrors(message: nil, errors: errors)
        
        return errors.count == 0
        
    }
    
    // error
    
    func handleErrors(message: String?, errors: NSDictionary?) {
        
        hideLoading()
        
        let requiredFields = getRequiredFields()
        
        for (_, fields) in requiredFields {
            let label = fields.lastObject as! UILabel
            label.text = ""
        }
        
        if errors != nil {
            for (key, errorMessages) in errors! {
                
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
