//
//  SwipeCard.swift
//  MyJobPitch
//
//  Created by dev on 12/22/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import MDCSwipeToChoose

class SwipeCard: MDCSwipeToChooseView {

    var button: UIButton!
    var label: UILabel!
    
    var touchCallback: (() -> Void)!
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    override init!(frame: CGRect, options: MDCSwipeToChooseViewOptions!) {
        
        super.init(frame: frame, options: options)
        
        options.threshold = UIScreen.main.bounds.size.width * 0.3
        options.likedColor = AppData.greenColor
        options.nopeColor = AppData.yellowColor
        
        button = UIButton(frame: CGRect(x: 0, y: 0, width: frame.size.width, height: frame.size.height))
        addSubview(button)
        
        imageView.backgroundColor = AppData.imageBGColor
        imageView.contentMode = .scaleAspectFill
        likedView.center = CGPoint(x: likedView.center.x+20, y: likedView.center.y+20)
        nopeView.center = CGPoint(x: nopeView.center.x-20, y: nopeView.center.y+20)
        
    }
    
    func setImage(imageUrl: String!, text: String) {
        
        if imageUrl != nil {
            AppHelper.loadImageURL(imageUrl: imageUrl, imageView: imageView, completion: nil)
        } else {
            imageView.image = UIImage(named: "default-logo")
        }
        
        let width = button.frame.size.width
        label = UILabel(frame: CGRect(x: width*0.45, y: button.frame.size.height-width*0.12, width: width*0.5, height: width*0.07))
        label.textColor = UIColor.white
        label.font = UIFont.boldSystemFont(ofSize: 26)
        label.textAlignment = .right
        label.text = text
        addSubview(label)
        
    }
    
    func setTouchEvent(callback:(() -> Void)!) {
        
        isUserInteractionEnabled = true
        touchCallback = callback
        button.addTarget(self, action: #selector(clickCard), for: .touchUpInside)
        
        let d = button.frame.size.width * 0.15
        let iconView = UIImageView(frame: CGRect(x: d*0.3, y: button.frame.size.height-d*1.3, width: d, height: d))
        iconView.image = UIImage(named: "touch-icon")
        addSubview(iconView)
        
        iconView.alpha = 0
        UIView.animate(withDuration: 0.2) { 
            iconView.alpha = 1
        }
        
    }
    
    func clickCard() {
        if touchCallback != nil {
            touchCallback()
        }
    }

}
