//
//  AppInfoMiddleView.swift
//  MyJobPitch
//
//  Created by bb on 9/19/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class AppInfoMiddleView: UIView {
    
    @IBOutlet var contentView: UIView!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var subTitleLabel: UILabel!
    @IBOutlet weak var attributeLabel: UILabel!
    
    var job: Job! {
        didSet {
            if job != nil {
                let deleted = job.status != JobStatus.JOB_STATUS_OPEN_ID
                AppHelper.loadLogo(job, imageView: imgView, completion: nil)
                imgView.alpha = deleted ? 0.5 : 1
                titleLabel.setDeletedText(job.title, isDeleted: deleted)
                subTitleLabel.setDeletedText(job.getBusinessName(), isDeleted: deleted)
            }
        }
    }
    
    var jobseeker: Jobseeker! {
        didSet {
            if jobseeker != nil {
                AppHelper.loadPhoto(jobseeker, imageView: imgView, completion: nil)
                titleLabel.text = jobseeker.getFullName()
                subTitleLabel.text = jobseeker.desc
            }
        }
    }
    
    var interview: Interview! {
        didSet {
            if interview != nil {
                let str = "Interview: " + AppHelper.dateToLongString((interview?.at)!)
                let subTitleParameters = [NSForegroundColorAttributeName : interview?.status == InterviewStatus.INTERVIEW_PENDING ? AppData.yellowColor : AppData.greenColor, NSFontAttributeName : UIFont.systemFont(ofSize: 12)]
                attributeLabel.attributedText = NSMutableAttributedString(string: str, attributes: subTitleParameters)
            }
            attributeLabel.isHidden = interview == nil
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
    
    
    
    func loadViewFromNib() {
        Bundle.main.loadNibNamed("AppInfoMiddleView", owner: self, options: nil)
        addSubview(contentView)
        contentView.frame = bounds
        contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    }    
}
