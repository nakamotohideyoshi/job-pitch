//
//  InterviewCell.swift
//  MyJobPitch
//
//  Created by TIGER1 on 6/26/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit
import MGSwipeTableCell

class InterviewCell: MGSwipeTableCell {

    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var name: UILabel!
    @IBOutlet weak var comment: UILabel!
    
    @IBOutlet weak var location: UILabel!
    @IBOutlet weak var dataTime: UILabel!
    @IBOutlet weak var status: UILabel!
}

