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
    
    func showLoading() {
        if loading == nil {
            loading = LoadingController()
            loading.addToView(parentView: view)
//            navigationItem.hidesBackButton = true
            navigationItem.leftBarButtonItem?.isEnabled = false
            navigationItem.rightBarButtonItem?.isEnabled = false
        }
        loading.labelView.isHidden = true
        loading.progressView.isHidden = true
        loading.indicatorView.isHidden = false
    }
    
    func showLoading(label: String!) {
        showLoading()
        loading.indicatorView.isHidden = true
        loading.labelView.isHidden = false
        loading.labelView.text = label
    }
    
    func showLoading(label: String!, withProgress: Float!) {
        showLoading()
        loading.indicatorView.isHidden = true
        loading.labelView.isHidden = false
        loading.labelView.text = label
        loading.progressView.isHidden = false
        loading.progressView.progress = withProgress
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
                    if errorMessage == "Invalid token." {
                        UserDefaults.standard.removeObject(forKey: "token")
                        API.shared().clearToken()
                        SideMenuController.pushController(id: "log_out")
                    } else {
                        PopupController.showGreen(errorMessage,
                                                  ok: nil, okCallback: nil,
                                                  cancel: "OK", cancelCallback: nil)
                    }
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
