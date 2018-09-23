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
    
    var job: Job! {
        didSet {
            if job != nil {
                AppHelper.loadLogo(job, imageView: imgView, completion: nil)
                titleLabel.text = job.title
                subTitleLabel.text = job.getBusinessName()
            }
        }
    }
    
    var jobSeeker: JobSeeker! {
        didSet {
            if jobSeeker != nil {
                AppHelper.loadPhoto(jobSeeker, imageView: imgView, completion: nil)
                titleLabel.text = jobSeeker.getFullName()
                subTitleLabel.text = jobSeeker.desc
            }
        }
    }
    
    var touch: (() -> Void)? {
        didSet {
            arrowIcon.isHidden = touch == nil
            button.isHidden = touch == nil
        }
    }

    func setDescription(icon: String, text: String) {
        imgView.image = UIImage(named: icon)?.withRenderingMode(.alwaysTemplate)
        imgView.tintColor = AppData.greenColor
        titleLabel.font = UIFont.systemFont(ofSize: 16)
        titleLabel.text = text
        titleLabel.numberOfLines = 0
        subTitleLabel.isHidden = true
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        loadViewFromNib()
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        loadViewFromNib()
    }
    
    @IBAction func clickActiom(_ sender: Any) {
        touch?()
    }
    
    func loadViewFromNib() {
        Bundle.main.loadNibNamed("AppInfoSmallView", owner: self, options: nil)
        addSubview(contentView)
        contentView.frame = bounds
        contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    }    
}
