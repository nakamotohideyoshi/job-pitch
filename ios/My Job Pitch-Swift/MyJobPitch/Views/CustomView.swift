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
        self.layer.cornerRadius = AppData.cornerRadius;
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
    
    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder);
        
        self.layer.cornerRadius = 6;
        self.layer.borderWidth = 0.5;
        self.layer.borderColor = AppData.greyBorderColor.cgColor;
    }
    
}

class ButtonTextField: UITextField {
    
    var clickCallback: (() -> Void)!;
    
    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder);
        
        delegate = self;
    }
}

extension ButtonTextField: UITextFieldDelegate {
    
    func textFieldShouldBeginEditing(_ textField: UITextField) -> Bool {
        clickCallback?();
        return false;
    }

}

extension UIView {
    
    func addUnderLine(paddingLeft: CGFloat, paddingRight: CGFloat, color: UIColor) {
        let border = CALayer()
        border.borderColor = color.cgColor
        border.borderWidth = 0.5
        border.frame = CGRect(x: paddingLeft, y: frame.size.height - 0.5, width: frame.size.width - paddingRight, height: 0.5)
        layer.addSublayer(border)
    }
}
