//
//  MJPController.swift
//  MyJobPitch
//
//  Created by dev on 12/20/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

class MJPController: UIViewController {
    
    @IBOutlet weak var scrollView: UIScrollView!
    
    var showKeyboard = false
    
    var loading: LoadingController!
    var allApplications: NSMutableArray!
    
    var isModal = false {
        didSet {
            if isModal {
                navigationItem.leftBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav-close"), style: .plain, target: self, action: #selector(closeController))
            } else {
                navigationItem.leftBarButtonItem = nil
            }
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let tap = UITapGestureRecognizer.init(target: self, action: #selector(dismissKeyboard))
        tap.delegate = self
        view.addGestureRecognizer(tap)
        
        self.navigationController?.navigationBar.topItem?.backBarButtonItem = UIBarButtonItem(title: "", style: .plain, target: nil, action: nil)
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(keyboardWasShown),
                                               name: Notification.Name.UIKeyboardDidShow,
                                               object: nil)
        
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(keyboardWillBeHidden),
                                               name: Notification.Name.UIKeyboardWillHide,
                                               object: nil)
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        NotificationCenter.default.removeObserver(self)
    }
    
    func showLoading(_ label: String!, withProgress: Float!, showIcon: Bool) {
        if loading == nil {
            loading = LoadingController()
            loading.addToView(parentView: view)
            //            navigationItem.hidesBackButton = true
            navigationItem.leftBarButtonItem?.isEnabled = false
            navigationItem.rightBarButtonItem?.isEnabled = false
        }
        
        loading.progressView.isHidden = withProgress == nil
        if withProgress != nil {
            loading.progressView.progress = withProgress
        }
        
        loading.labelView.isHidden = label == nil || label == ""
        loading.labelView.text = label
        
        loading.indicatorView.isHidden = !showIcon
    }
    
    func showLoading(_ label: String!, withProgress: Float!) {
        showLoading(label, withProgress: withProgress, showIcon: withProgress == nil && label == nil)
    }
    
    func showLoading(_ label: String!) {
        showLoading(label, withProgress: nil, showIcon: label == nil)
    }
    
    func showLoading() {
        showLoading(nil, withProgress: nil, showIcon: true)
    }
    
    func hideLoading() {
        if loading != nil {
            loading.view.removeFromSuperview()
            loading = nil
//            navigationItem.hidesBackButton = false
            navigationItem.leftBarButtonItem?.isEnabled = true
            navigationItem.rightBarButtonItem?.isEnabled = true
        }
    }
    
    func setTitle(title: String, subTitle: String) {
        let titleParameters = [NSForegroundColorAttributeName : UIColor.white,
                               NSFontAttributeName : UIFont.boldSystemFont(ofSize: 17)]
        let subtitleParameters = [NSForegroundColorAttributeName : UIColor.white,
                                  NSFontAttributeName : UIFont.systemFont(ofSize: 11)]
        
        let mutableTitle:NSMutableAttributedString = NSMutableAttributedString(string: title, attributes: titleParameters)
        let mutableSubtitle:NSAttributedString = NSAttributedString(string: subTitle, attributes: subtitleParameters)
        
        mutableTitle.append(NSAttributedString(string: "\n"))
        mutableTitle.append(mutableSubtitle)
        
        let width = title.size().width
        let height = navigationController?.navigationBar.frame.size.height
        let titleLabel = UILabel(frame: CGRect(x: 0, y: 0, width: width, height: height!))
        
        titleLabel.attributedText = mutableTitle
        titleLabel.numberOfLines = 0
        titleLabel.textAlignment = .center
        
        navigationItem.titleView = titleLabel
    }
    
    // keyboard
    
    func keyboardWasShown(_ notification: NSNotification) {

        showKeyboard = true
        
        if scrollView != nil {
            let bottom_h = AppHelper.getFrontController().view.frame.size.height - view.frame.origin.y - view.frame.size.height
            let info = notification.userInfo
            let keyboardRect = (info?[UIKeyboardFrameEndUserInfoKey] as! NSValue).cgRectValue
            let contentInsets = UIEdgeInsets(top: 0, left: 0, bottom: keyboardRect.height - bottom_h, right: 0)
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
    
    func getRequiredFields() -> [String: (UIView, UILabel)] {
        return [String: (UIView, UILabel)]()
    }
    
    func valid() -> Bool {
        
        view.endEditing(true)
        
        let errors = NSMutableDictionary()
        let requiredFields = getRequiredFields()
        var firstField: UIView? = nil
        
        for (key, (field, _)) in requiredFields {
            var str = ""
            if let tf = field as? UITextField {
                str = tf.text!
            } else if let tv = field as? UITextView {
                str = tv.text!
            }
            if str.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                errors[key] = ["This field is required."]
                if (firstField == nil) {
                    firstField = field
                    let frame = field.frame
                    let origin = CGPoint(x: frame.origin.x, y: frame.origin.y - 15)
                    let rect = CGRect(origin: origin, size: frame.size)
                    scrollView.scrollRectToVisible(rect, animated: true);
                }
            }
        }
        
        handleError(errors)
        
        return errors.count == 0
    }
    
    // error
    
    func handleError(_ error: Any?) {
        if error == nil {
            return
        }
        
        hideLoading()
        
        if let message = error as? String {
            PopupController.showGray(message, ok: "OK")
            return
        }
        
        if let userInfo = error as? [String: Any] {
            let requiredFields = getRequiredFields()
            
            for (_, (_, errorLabel)) in requiredFields {
                errorLabel.text = ""
            }
            
            for (key, value) in userInfo {
                
                var message: String!
                if let msg = value as? String {
                    message = msg
                } else if let arr = value as? [String] {
                    message = arr[0]
                }
                
                if let fields = requiredFields[key] {
                    fields.1.text = message
                } else {
                    message = message == nil ? key : key + ": " + message
                    PopupController.showGray(message, ok: "OK")
                }
            }
        }
    }
    
    func closeController() {
        if (isModal) {
            dismiss(animated: true, completion: nil)
        } else {
            _ = navigationController?.popViewController(animated: true)
        }
    }
        
}

extension MJPController: UIGestureRecognizerDelegate {
    
    func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
        return showKeyboard
    }
    
}
