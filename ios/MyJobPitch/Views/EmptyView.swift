//
//  EmptyView.swift
//  MyJobPitch
//
//  Created by bb on 9/23/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class EmptyView: UIView {

    @IBOutlet var contentView: UIView!
    @IBOutlet weak var message: UILabel!
    @IBOutlet weak var button: UIButton!
    
    var action: (() -> Void)! {
        didSet {
            button.isHidden = action == nil
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
    
    @IBAction func clickAction(_ sender: Any) {
        action?()
    }
    
    func loadViewFromNib() {
        Bundle.main.loadNibNamed("EmptyView", owner: self, options: nil)
        addSubview(contentView)
        contentView.frame = bounds
        contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    }
}
