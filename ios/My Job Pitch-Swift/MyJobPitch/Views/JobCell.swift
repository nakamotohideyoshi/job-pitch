//
//  JobCell.swift
//  MyJobPitch
//
//  Created by dev on 12/23/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class JobCell: MGSwipeTableCell {

    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var subTitle: UILabel!
    
    func setData(_ job: Job) {
        
        AppHelper.loadLogo(job, imageView: imgView, completion: nil)
        titleLabel.text = job.title
        subTitle.text = job.getBusinessName()
        
        if job.status == AppData.getJobStatusByName(JobStatus.JOB_STATUS_OPEN).id {
            setOpacity(1)
            backgroundColor = UIColor.white
        } else {
            var str: NSMutableAttributedString =  NSMutableAttributedString(string: titleLabel.text!)
            str.addAttribute(NSFontAttributeName, value: UIFont.systemFont(ofSize: 20), range: NSMakeRange(0, str.length))
            str.addAttribute(NSStrikethroughStyleAttributeName, value: 1, range: NSMakeRange(0, str.length))
            titleLabel.attributedText = str
            
            str =  NSMutableAttributedString(string: subTitle.text!)
            str.addAttribute(NSFontAttributeName, value: UIFont.systemFont(ofSize: 16), range: NSMakeRange(0, str.length))
            str.addAttribute(NSStrikethroughStyleAttributeName, value: 1, range: NSMakeRange(0, str.length))
            subTitle.attributedText = str
            
            setOpacity(0.5)
            backgroundColor = UIColor(red: 240/255.0, green: 240/255.0, blue: 240/255.0, alpha: 0.5)
        }
        
        addUnderLine(paddingLeft: 12, paddingRight: 0, color: AppData.greyColor)     
    }
    
    func setOpacity(_ alpha: CGFloat) {
        imgView.alpha = alpha
        titleLabel.alpha = alpha
        subTitle.alpha = alpha
    }
    
}
