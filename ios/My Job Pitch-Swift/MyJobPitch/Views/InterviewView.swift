//
//  InterviewView.swift
//  MyJobPitch
//
//  Created by bb on 9/21/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class InterviewView: UIView {

    @IBOutlet var contentView: UIView!
    @IBOutlet weak var statusLabel: UILabel!
    @IBOutlet weak var datetimeLabel: UILabel!
    @IBOutlet weak var locationLabel: UILabel!

    @IBOutlet weak var cancelView: UIView!
    @IBOutlet weak var acceptView: UIView!
    @IBOutlet weak var completeView: UIView!
    
    var acceptCallback: (() -> Void)? {
        didSet {
            updateAcceptButtonView()
        }
    }
    
    var completeCallback: (() -> Void)? {
        didSet {
            updateCompleteButtonView()
        }
    }
    
    var cancelCallback: (() -> Void)? {
        didSet {
            updateCancelButtonView()
        }
    }
    
    var interview: ApplicationInterview? {
        didSet {
            let pending = interview?.status == InterviewStatus.INTERVIEW_PENDING
            let accepted = interview?.status == InterviewStatus.INTERVIEW_ACCEPTED
            
            if pending {
                statusLabel.text = AppData.user.isJobSeeker() ? "Interview request received" : "Interview request sent"
            } else if accepted {
                statusLabel.text = "Interview accepted"
            } else if interview?.status == InterviewStatus.INTERVIEW_COMPLETED {
                statusLabel.text = "This interview is done"
            } else {
                statusLabel.text = "Interview cancelled by " + (AppData.user.isRecruiter() ? "Recruiter" : "Jobseeker")
            }
            
            datetimeLabel.text = AppHelper.dateToLongString((interview?.at)!)
            
            updateAcceptButtonView()
            updateCompleteButtonView()
            updateCancelButtonView()
        }
    }
    
    var application: Application? {
        didSet {
            locationLabel.text = application?.job.locationData.placeName
        }
    }
        
    override init(frame: CGRect) {
        super.init(frame: frame)
        loadViewFromNib()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        loadViewFromNib()
    }
    
    @IBAction func acceptAction(_ sender: Any) {
        acceptCallback?()
    }
    
    @IBAction func completeAction(_ sender: Any) {
        completeCallback?()
    }
    
    @IBAction func cancelAction(_ sender: Any) {
        cancelCallback?()
    }
    
    func updateAcceptButtonView() {
        acceptView.isHidden = acceptCallback == nil || interview?.status != InterviewStatus.INTERVIEW_PENDING || AppData.user.isRecruiter()
    }
    func updateCompleteButtonView() {
        completeView.isHidden = completeCallback == nil || (interview?.status != InterviewStatus.INTERVIEW_PENDING && interview?.status != InterviewStatus.INTERVIEW_ACCEPTED) || AppData.user.isJobSeeker()
    }
    func updateCancelButtonView() {
        cancelView.isHidden = cancelCallback == nil || (interview?.status != InterviewStatus.INTERVIEW_PENDING && interview?.status != InterviewStatus.INTERVIEW_ACCEPTED)
    }
    
    func loadViewFromNib() {
        Bundle.main.loadNibNamed("InterviewView", owner: self, options: nil)
        addSubview(contentView)
        contentView.frame = bounds
        contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    }
}
