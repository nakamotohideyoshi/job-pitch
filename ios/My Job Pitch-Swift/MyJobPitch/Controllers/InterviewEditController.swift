//
//  InterviewEditController.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/29/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class InterviewEditController: MJPController, WWCalendarTimeSelectorProtocol {
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var commentLabel: UILabel!
    @IBOutlet weak var dateTimeField: UITextField!
    @IBOutlet weak var dateTimeError: UILabel!
    @IBOutlet weak var messageTextView: BorderTextView!
    @IBOutlet weak var messageError: UILabel!
    @IBOutlet weak var notesTextView: BorderTextView!
    @IBOutlet weak var feedbackTextView: BorderTextView!
    @IBOutlet weak var saveButton: GreenButton!
    @IBOutlet weak var appInfoView: UIView!
    
    var application: Application!
    var interview: ApplicationInterview?
    var isComplete = false
    
    var dateTime: Date! = Date()
    
    var saveComplete: ((Application) -> Void)!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        var title = "Arrange Interview"
        if isComplete {
            title = "Complete Interview"
        } else if interview != nil {
            title = "Edit Interview"
        }
        let subTitle = String(format: "%@, (%@)", application.job.title, application.job.getBusinessName())
        setTitle(title: title, subTitle: subTitle)
        
        isModal = true
        
        dateTimeField.delegate = self
        
        loadData()
    }
    
    override func getRequiredFields() -> [String: NSArray] {
        return [
            "at":           [dateTimeField,    dateTimeError],
            "invitation":    [messageTextView, messageError],
        ]
    }
    
    func loadData() {
        AppHelper.loadJobseekerAvatar(application.jobSeeker, imageView: imgView, completion: nil)
        nameLabel.text = application.jobSeeker.getFullName()
        commentLabel.text = application.jobSeeker.desc
        imgView.superview?.addUnderLine(paddingLeft: 0, paddingRight: 0, color: AppData.greyColor)
        
        feedbackTextView.superview?.isHidden = true
        
        if interview != nil {
            dateTime = interview?.at
            dateTimeField.text = AppHelper.convertDateToString(dateTime, short: false)
            
            if (interview?.messages.count)! > 0 {
                messageTextView.text = (interview?.messages[0] as! Message).content
            }
            
            notesTextView.text = interview?.notes
            
            if isComplete {
                dateTimeField.isEnabled = false
                messageTextView.isEditable = false
                notesTextView.isEditable = false
                feedbackTextView.superview?.isHidden = false
                
                saveButton.setTitle("Complete", for: .normal)
            } else {
                saveButton.setTitle("Update", for: .normal)
            }
        }
    }
    
    @IBAction func appDetailAction(_ sender: Any) {
        let controller = JobSeekerDetailController.instantiate()
        controller.application = application
        controller.viewMode = true
        navigationController?.pushViewController(controller, animated: true)
    }
    
    func saveInterview() {
        let interviewForSave = InterviewForSave()
        interviewForSave.at = dateTime
        interviewForSave.application = application.id
        interviewForSave.invitation = messageTextView.text
        interviewForSave.notes = notesTextView.text
        interviewForSave.feedback = feedbackTextView.text
        
        API.shared().saveInterview(interviewId: interview?.id, interview: interviewForSave, success: { (_) in
            AppData.updateApplication(self.application.id, success: { (application) in
                self.closeModal()
                self.saveComplete?(application)
            }, failure: self.handleErrors)
        }, failure: self.handleErrors)
    }
    
    @IBAction func sendAction(_ sender: Any) {
        
        if !valid() {
            return
        }
        
        showLoading()
        
        if isComplete {
            API.shared().changeInterview(interviewId: (self.interview?.id)!, type: "complete", success: { (_) in
                self.saveInterview()
            }, failure: self.handleErrors)
        } else {
            saveInterview()
        }
    }
    
    func showDateTimePicker() {
        
        let selector = WWCalendarTimeSelector.instantiate()
        selector.delegate = self
        selector.optionTopPanelTitle = "Choose Date/Time"
        selector.optionCurrentDate = dateTime
        selector.optionStyles.showYear(true)
        selector.optionStyles.showDateMonth(true)
        selector.optionStyles.showTime(true)
        
        present(selector, animated: true, completion: nil)
    }
    
    func WWCalendarTimeSelectorDone(_ selector: WWCalendarTimeSelector, date: Date) {
        dateTime = date
        dateTimeField.text = AppHelper.convertDateToString(dateTime, short: false)
    }
    
    static func instantiate() -> InterviewEditController {
        return AppHelper.instantiate("InterviewEdit") as! InterviewEditController
    }
    
}

extension InterviewEditController: UITextFieldDelegate {
    func textFieldShouldBeginEditing(_ textField: UITextField) -> Bool {
        if dateTimeField == textField {
            showDateTimePicker()
        }
        return false
    }
}
