//
//  LoadingController.swift
//  MyJobPitch
//
//  Created by bb on 9/18/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class LoadingController: NSObject {

    var view: UIView!
    var indicatorView: UIActivityIndicatorView!
    var labelView: UILabel!
    var progressView: UIProgressView!
    
    public override init() {
        view = UINib(nibName: "LoadingView", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! UIView
        view.translatesAutoresizingMaskIntoConstraints = false
        indicatorView = view.viewWithTag(1) as! UIActivityIndicatorView
        labelView = view.viewWithTag(2) as! UILabel
        progressView = view.viewWithTag(3) as! UIProgressView
    }
    
    func addToView(parentView: UIView!) {
        parentView.addSubview(view)
        parentView.addConstraint(NSLayoutConstraint(item: view, attribute: .leading, relatedBy: .equal, toItem: parentView, attribute: .leading, multiplier: 1.0, constant: 0))
        parentView.addConstraint(NSLayoutConstraint(item: view, attribute: .trailing, relatedBy: .equal, toItem: parentView, attribute: .trailing, multiplier: 1.0, constant: 0))
        parentView.addConstraint(NSLayoutConstraint(item: view, attribute: .top, relatedBy: .equal, toItem: parentView, attribute: .top, multiplier: 1.0, constant: 0))
        parentView.addConstraint(NSLayoutConstraint(item: view, attribute: .bottom, relatedBy: .equal, toItem: parentView, attribute: .bottom, multiplier: 1.0, constant: 0))
    }
    
}
