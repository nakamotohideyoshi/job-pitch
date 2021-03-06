//
//  CustomView.swift
//  MyJobPitch
//
//  Created by dev on 12/26/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

class RoundButton: UIButton {
    
    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder);
        self.layer.cornerRadius = 6
    }
    
}

class GreenButton: RoundButton {
    
    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder);
        self.backgroundColor = AppData.greenColor;
    }
    
}

class YellowButton: RoundButton {
    
    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder);
        self.backgroundColor = AppData.yellowColor;
    }
    
}

class GreyButton: RoundButton {
    
    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder);
        self.backgroundColor = AppData.greyColor;
    }
    
}

class BorderTextView: UITextView {
    
    override var isEditable: Bool {
        didSet {
            self.backgroundColor = isEditable ? UIColor.white : UIColor(red: 249/255.0, green: 249/255.0, blue: 249/255.0, alpha: 1)
            self.textColor = isEditable ? UIColor.black : UIColor.lightGray            
        }
    }
    
    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder);
        
        self.layer.cornerRadius = 6;
        self.layer.borderWidth = 0.5;
        self.layer.borderColor = AppData.greyColor.cgColor;
        
        self.textContainerInset = UIEdgeInsetsMake(11, 3, 11, 3)
    }
}

class ButtonTextField: UITextField {
    
    var clickCallback: (() -> Void)!
    
    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        delegate = self;
    }
}

extension ButtonTextField: UITextFieldDelegate {
    
    func textFieldShouldBeginEditing(_ textField: UITextField) -> Bool {
        clickCallback?();
        return false;
    }

}

class BadgeIcon: UILabel {
    
    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        self.clipsToBounds = true
        self.layer.cornerRadius = 10        
    }
    
    override func drawText(in rect: CGRect) {
        let insets = UIEdgeInsets(top: 1, left: 6, bottom: 2, right: 6)
        super.drawText(in: UIEdgeInsetsInsetRect(rect, insets))
    }
    
    override var intrinsicContentSize: CGSize {
        get {
            var contentSize = super.intrinsicContentSize
            contentSize.height += 3
            contentSize.width = contentSize.width < 8 ? 21 : contentSize.width + 12
            return contentSize
        }
    }
    
}

class CircleView: UIView {
    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        layer.cornerRadius = frame.width / 2
    }
}

extension UIView {
    
    func addUnderLine(paddingLeft: CGFloat, paddingRight: CGFloat, color: UIColor) {
        let border = CALayer()
        border.borderColor = color.cgColor
        border.borderWidth = 0.5
        border.frame = CGRect(x: paddingLeft, y: frame.size.height - 0.5, width: frame.size.width - paddingLeft - paddingRight, height: 0.5)
        layer.addSublayer(border)
    }
}

extension UILabel {

    func setDeletedText(_ str: String, isDeleted: Bool) {
        if !isDeleted {
            attributedText = nil
            text = str
            alpha = 1
            return
        }

        let str1: NSMutableAttributedString =  NSMutableAttributedString(string: str)
        str1.addAttribute(NSStrikethroughStyleAttributeName, value: 1, range: NSMakeRange(0, str1.length))
        str1.addAttribute(NSFontAttributeName, value: UIFont.italicSystemFont(ofSize: font.pointSize), range: NSMakeRange(0, str1.length))
        attributedText = str1
        alpha = 0.5
    }
}

extension UITableViewCell {
    
    func drawUnderline() {
        addUnderLine(paddingLeft: 12, paddingRight: 0, color: AppData.greyColor)
    }
}
