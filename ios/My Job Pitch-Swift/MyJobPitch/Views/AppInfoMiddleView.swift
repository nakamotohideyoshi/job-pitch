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
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        loadViewFromNib()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        loadViewFromNib()
    }
    
    func setData(_ data: NSObject!, interview: ApplicationInterview?) {
        
        if let job = data as? Job {
            AppHelper.loadLogo(job, imageView: imgView, completion: nil)
            titleLabel.text = job.title
            subTitleLabel.text = job.getBusinessName()
        } else if let jobseeker = data as? JobSeeker {
            AppHelper.loadPhoto(jobseeker, imageView: imgView, completion: nil)
            titleLabel.text = jobseeker.getFullName()
            subTitleLabel.text = jobseeker.desc
        }
        
        if interview != nil {
            let str = "Interview: " + AppHelper.dateToLongString((interview?.at)!)
            let subTitleParameters = [NSForegroundColorAttributeName : interview?.status == InterviewStatus.INTERVIEW_PENDING ? AppData.yellowColor : AppData.greenColor, NSFontAttributeName : UIFont.systemFont(ofSize: 12)]
            attributeLabel.attributedText = NSMutableAttributedString(string: str, attributes: subTitleParameters)
        }
        
        attributeLabel.isHidden = interview == nil
    }
    
    func loadViewFromNib() {
        Bundle.main.loadNibNamed("AppInfoMiddleView", owner: self, options: nil)
        addSubview(contentView)
        contentView.frame = bounds
        contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    }    
}
