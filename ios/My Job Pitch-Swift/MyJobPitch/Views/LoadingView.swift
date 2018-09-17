//
//  LoadingView.swift
//  MyJobPitch
//
//  Created by dev on 8/10/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

class LoadingView: UIView {
    
    var indicatorView: UIActivityIndicatorView!
    var progressView: UIProgressView!
    var labelView: UILabel!
    
    func showLoadingIcon(_ label: String!) {
        if progressView != nil {
            progressView.removeFromSuperview()
            progressView = nil
        }
        
        if label != nil && label != "" {
            if labelView == nil {
                labelView = UILabel()
                addSubview(labelView)
            }
            labelView.text = label
            labelView.sizeToFit()
            labelView.center = CGPoint(x: frame.size.width*0.5, y: frame.size.height*0.5 - 15)
        } else {
            if labelView != nil {
                labelView.removeFromSuperview()
                labelView = nil
            }
        }
        if indicatorView == nil {
            indicatorView = UIActivityIndicatorView()
            indicatorView.activityIndicatorViewStyle = UIActivityIndicatorViewStyle.whiteLarge
            indicatorView.color = UIColor.black
            indicatorView.startAnimating()
            addSubview(indicatorView)
        }
        
        indicatorView.center = CGPoint(x: frame.size.width*0.5, y: frame.size.height*0.5)
        
    }
    
    func showProgressBar(_ label: String!) {
        if indicatorView != nil {
            indicatorView.removeFromSuperview()
            indicatorView = nil
        }
        
        if label != nil {
            if labelView == nil {
                labelView = UILabel()
                addSubview(labelView)
            }
            labelView.text = label
            labelView.sizeToFit()
            labelView.center = CGPoint(x: frame.size.width*0.5, y: frame.size.height*0.5 - 15)
        } else {
            if labelView != nil {
                labelView.removeFromSuperview()
                labelView = nil
            }
        }
        
        if progressView == nil {
            progressView = UIProgressView()
            progressView.frame.size.width = frame.size.width / 2
            progressView.tintColor = AppData.greenColor
            addSubview(progressView)
        }
        progressView.center = CGPoint(x: frame.size.width*0.5, y: frame.size.height*0.5 + (labelView != nil ? 15 : 0))
    }
    
    static func create(parentView: UIView) -> LoadingView {
        
        let loadingView = LoadingView()
        loadingView.frame = parentView.frame
//        loadingView.frame.origin.y = 20
//        loadingView.frame.size.height = loadingView.frame.size.height - 20
        loadingView.backgroundColor = UIColor.white
        parentView.addSubview(loadingView)
        
        loadingView.showLoadingIcon("")
        
        return loadingView
    }
    
}
