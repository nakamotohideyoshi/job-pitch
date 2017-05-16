//
//  SwipeCard.swift
//  MyJobPitch
//
//  Created by dev on 12/22/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

class SwipeCard: MDCSwipeToChooseView {

    var button: UIButton!
    var distanceLabel: UILabel!
    var nameLabel: UILabel!
    var descLabel: UILabel!
    
    var touchCallback: (() -> Void)!
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    override init!(frame: CGRect, options: MDCSwipeToChooseViewOptions!) {
        
        super.init(frame: frame, options: options)
        
        button = UIButton(frame: CGRect(x: 0, y: 0, width: frame.size.width, height: frame.size.height))
        addSubview(button)
        
        imageView.backgroundColor = AppData.imageBGColor
        imageView.contentMode = .scaleAspectFill
        likedView.center = CGPoint(x: likedView.center.x, y: likedView.center.y+10)
        nopeView.center = CGPoint(x: nopeView.center.x-20, y: nopeView.center.y+10)
        
        backgroundColor = UIColor.white
        imageView.frame.origin.x += 10
        imageView.frame.origin.y += 10
        imageView.frame.size.width -= 20
        imageView.frame.size.height -= 100
        
    }
    
    func setImage(imageUrl: String!, distance: String, name: String, desc: String) {
        
        if imageUrl != nil {
            AppHelper.loadImageURL(imageUrl: imageUrl, imageView: imageView, completion: nil)
        } else {
            imageView.image = UIImage(named: "default-logo")
        }
        
        let size = frame.size
        
        distanceLabel = UILabel(frame: CGRect(x: size.width - 120, y: size.height-130, width: 100, height: 25))
        distanceLabel.textColor = UIColor.white
        distanceLabel.font = UIFont.boldSystemFont(ofSize: 26)
        distanceLabel.textAlignment = .right
        distanceLabel.text = distance
        addSubview(distanceLabel)
        
        nameLabel = UILabel(frame: CGRect(x: 15, y: size.height-75, width: size.width - 30, height: 25))
        nameLabel.textColor = UIColor(red: 51/255.0, green: 51/255.0, blue: 51/255.0, alpha: 1)
        nameLabel.font = UIFont.boldSystemFont(ofSize: 20)
        nameLabel.text = name
        addSubview(nameLabel)
        
        descLabel = UILabel(frame: CGRect(x: 15, y: size.height-45, width: size.width - 40, height: 25))
        descLabel.textColor = UIColor(red: 191/255.0, green: 191/255.0, blue: 191/255.0, alpha: 1)
        descLabel.font = UIFont.boldSystemFont(ofSize: 18)
        descLabel.text = desc
        addSubview(descLabel)
        
    }
    
    func setTouchEvent(callback:(() -> Void)!) {
        
        isUserInteractionEnabled = true
        touchCallback = callback
        button.addTarget(self, action: #selector(clickCard), for: .touchUpInside)
        
        let iconView = UIImageView(frame: CGRect(x: 25, y: button.frame.size.height-155, width: 50, height: 50))
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
