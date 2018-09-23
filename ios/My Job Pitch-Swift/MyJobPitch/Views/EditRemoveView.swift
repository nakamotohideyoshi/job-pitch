//
//  EditRemoveView.swift
//  MyJobPitch
//
//  Created by bb on 9/22/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class EditRemoveView: UIView {

    @IBOutlet var contentView: UIView!
    @IBOutlet weak var editButton: UIButton!
    @IBOutlet weak var removeButton: UIButton!
    
    var editCallback: (() -> Void)? {
        didSet {
            editButton.backgroundColor = editCallback != nil ? UIColor.clear : UIColor(red: 0, green: 0, blue: 0, alpha: 0.5)
            editButton.isEnabled = editCallback != nil
        }
    }
    
    var removeCallback: (() -> Void)? {
        didSet {
            removeButton.backgroundColor = removeCallback != nil ? UIColor.clear : UIColor(red: 0, green: 0, blue: 0, alpha: 0.5)
            removeButton.isEnabled = removeCallback != nil
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
    
    @IBAction func editAction(_ sender: Any) {
        editCallback?()
    }
    
    @IBAction func removeAction(_ sender: Any) {
        removeCallback?()
    }
    
    func loadViewFromNib() {
        Bundle.main.loadNibNamed("EditRemoveView", owner: self, options: nil)
        addSubview(contentView)
        contentView.frame = bounds
        contentView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    }
}
