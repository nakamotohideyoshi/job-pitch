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
    @IBOutlet weak var feedbackView: UIView!
    @IBOutlet weak var saveButton: GreenButton!
    @IBOutlet weak var appInfoView: UIView!
    
    var application: Application!
    var interview: ApplicationInterview?
    var isComplete = false
    
    var dateTime: Date! = Date()
    
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
        
        navigationItem.leftBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav-close"), style: .plain, target: self, action: #selector(closeAction))
        
        appInfoView.addUnderLine(paddingLeft: 0, paddingRight: 0, color: AppData.greyBorderColor)
        
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
        AppHelper.loadJobseekerImage(application.jobSeeker, imageView: imgView, completion: nil)
        nameLabel.text = application.jobSeeker.getFullName()
        commentLabel.text = application.jobSeeker.desc
        
        feedbackView.isHidden = true
        
        if interview != nil {
            dateTime = interview?.at
            dateTimeField.text = AppHelper.convertDateToString(dateTime)
            
            if (interview?.messages.count)! > 0 {
                messageTextView.text = (interview?.messages[0] as! Message).content
            }
            
            notesTextView.text = interview?.notes
            
            if isComplete {
                dateTimeField.isEnabled = false
                messageTextView.isEditable = false
                notesTextView.isEditable = false
                feedbackView.isHidden = false
                
                saveButton.setTitle("Complete", for: .normal)
            } else {
                saveButton.setTitle("Update", for: .normal)
            }
        }
    }
    
    @IBAction func appDetailAction(_ sender: Any) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobSeekerDetail") as! JobSeekerDetailController
        controller.application = application
        controller.onlyView = true
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
            AppData.updateApplication(self.application.id, success: self.closeAction, failure: self.handleErrors)
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
        dateTimeField.text = AppHelper.convertDateToString(dateTime)
    }
    
    func closeAction() {
        navigationController?.dismiss(animated: true, completion: nil)
    }
    
    static func instantiate() -> InterviewEditController {
        return AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "InterviewEdit") as! InterviewEditController
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
