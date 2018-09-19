//
//  AppInfoSmallView.swift
//  MyJobPitch
//
//  Created by bb on 9/19/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class AppInfoSmallView: UIView {

    @IBOutlet var contentView: UIView!
    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var subTitleLabel: UILabel!
    @IBOutlet weak var arrowIcon: UIImageView!
    @IBOutlet weak var button: UIButton!
    
    var touchCallback: (() -> Void)? {
        didSet {
            arrowIcon.isHidden = touchCallback == nil
            button.isHidden = touchCallback == nil
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
    
    func setData(_ data: NSObject!, touch: (() -> Void)?) {
        
        touchCallback = touch
        
        if let job = data as? Job {
            AppHelper.loadLogo(image: job.getImage(), imageView: imgView, completion: nil)
            titleLabel.text = job.title
            subTitleLabel.text = job.getBusinessName()
            return
        }
        
        if let jobseeker = data as? JobSeeker {
            AppHelper.loadJobseekerAvatar(jobseeker, imageView: imgView, completion: nil)
            titleLabel.text = jobseeker.getFullName()
            subTitleLabel.text = jobseeker.desc
        }
    }
    
    @IBAction func clickActiom(_ sender: Any) {
        touchCallback?()
    }
    
    func loadViewFromNib() {
        Bundle.main.loadNibNamed("AppInfoSmall", owner: self, options: nil)
        addSubview(contentView)
        contentView.frame = bounds
        contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    }
    
}
