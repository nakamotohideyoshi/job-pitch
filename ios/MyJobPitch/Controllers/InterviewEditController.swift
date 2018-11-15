//
//  InterviewEditController.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/29/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class InterviewEditController: MJPController {
    
    @IBOutlet weak var infoView: AppInfoSmallView!
    
    @IBOutlet weak var dateTimeField: UITextField!
    @IBOutlet weak var dateTimeError: UILabel!
    @IBOutlet weak var messageTextView: BorderTextView!
    @IBOutlet weak var messageError: UILabel!
    @IBOutlet weak var notesTextView: BorderTextView!
    @IBOutlet weak var feedbackTextView: BorderTextView!
    @IBOutlet weak var saveButton: GreenButton!
    
    public var application: Application!
    public var interview: Interview?
    public var isComplete = false
    
    var dateTime: Date! = Date()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        isModal = true
        
        var title = "Arrange Interview"
        if isComplete {
            title = "Complete Interview"
        } else if interview != nil {
            title = "Edit Interview"
        }
        let subTitle = String(format: "%@, (%@)", application.job.title, application.job.getBusinessName())
        setTitle(title: title, subTitle: subTitle)
        
        dateTimeField.delegate = self
        
        infoView.addUnderLine(paddingLeft: 0, paddingRight: 0, color: AppData.greyColor)
        
        loadData()
    }
    
    override func getRequiredFields() -> [String: (UIView, UILabel)] {
        return [
            "at":           (dateTimeField,    dateTimeError),
            "invitation":   (messageTextView, messageError),
        ]
    }
    
    func loadData() {
        infoView.jobseeker = application.jobseeker
        infoView.touch = {
            let controller = JobseekerDetailsController.instantiate()
            controller.application = self.application
            controller.viewMode = true
            self.navigationController?.pushViewController(controller, animated: true)
        }
        
        feedbackTextView.superview?.isHidden = true
        
        if interview != nil {
            dateTime = interview?.at
            dateTimeField.text = AppHelper.dateToLongString(dateTime)
            
            if (interview?.messages.count)! > 0 {
                messageTextView.text = (interview?.messages[0] as! Message).content
            }
            
            notesTextView.text = interview?.notes
            
            if isComplete {
                dateTimeField.superview?.isHidden = true
                messageTextView.superview?.isHidden = true
                feedbackTextView.superview?.isHidden = false
            }
            
            saveButton.setTitle(isComplete ? "Complete" : "Update", for: .normal)
        }
    }
    
    func saveInterview() {
        
    }
    
    @IBAction func sendAction(_ sender: Any) {
        
        if !valid() {
            return
        }
        
        showLoading()
        
        if isComplete {
            let interviewForSave = InterviewForSave()
            interviewForSave.id = interview?.id
            interviewForSave.notes = notesTextView.text
            interviewForSave.feedback = feedbackTextView.text

            API.shared().changeInterview(interviewForSave, type: "complete") { (_, error) in
                if error == nil {
                    AppData.getApplication(self.application.id) { (_, error) in
                        if error == nil {
                            self.closeController()
                        } else {
                            self.handleError(error)
                        }
                    }
                } else {
                    self.handleError(error)
                }
            }
        } else {
            let interviewForSave = InterviewForSave()
            interviewForSave.id = interview?.id
            interviewForSave.at = dateTime
            interviewForSave.application = application.id
            interviewForSave.invitation = messageTextView.text
            interviewForSave.notes = notesTextView.text
            interviewForSave.feedback = ""
            
            API.shared().saveInterview(interviewForSave) { (_, error) in
                if error == nil {
                    AppData.getApplication(self.application.id) { (_, error) in
                        if error == nil {
                            self.closeController()
                        } else {
                            self.handleError(error)
                        }
                    }
                } else {
                    self.handleError(error)
                }
            }
        }
    }
    
    static func instantiate() -> InterviewEditController {
        return AppHelper.instantiate("InterviewEdit") as! InterviewEditController
    }
}

extension InterviewEditController: UITextFieldDelegate {
    func textFieldShouldBeginEditing(_ textField: UITextField) -> Bool {
        if dateTimeField == textField {
            let selector = WWCalendarTimeSelector.instantiate()
            selector.delegate = self
            selector.optionTopPanelTitle = "Choose Date/Time"
            selector.optionCurrentDate = dateTime
            selector.optionStyles.showYear(true)
            selector.optionStyles.showDateMonth(true)
            selector.optionStyles.showTime(true)
            
            present(selector, animated: true, completion: nil)
        }
        return false
    }
}

extension InterviewEditController: WWCalendarTimeSelectorProtocol {
    
    func WWCalendarTimeSelectorDone(_ selector: WWCalendarTimeSelector, date: Date) {
        dateTime = date
        dateTimeField.text = AppHelper.dateToLongString(dateTime)
    }
}
