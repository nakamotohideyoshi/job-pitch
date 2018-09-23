//
//  SmallToolbar.swift
//  MyJobPitch
//
//  Created by bb on 9/22/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class SmallToolbar: UIView {

    @IBOutlet var contentView: UIView!
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var toolbar: UIToolbar!
    
    var rightAction: (() -> Void)! {
        didSet {
            if rightAction == nil {
                if (toolbar.items?.count)! > 1 {
                    _ = toolbar.items?.popLast()
                }
            } else {
                if (toolbar.items?.count)! == 1 {
                    let rightMenu = UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(rightMenuAction))
                    toolbar.items?.append(rightMenu)
                }
            }
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
    
    func rightMenuAction() {
        rightAction?()
    }
    
    func loadViewFromNib() {
        Bundle.main.loadNibNamed("SmallToolbar", owner: self, options: nil)
        addSubview(contentView)
        contentView.frame = bounds
        contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    }

}
