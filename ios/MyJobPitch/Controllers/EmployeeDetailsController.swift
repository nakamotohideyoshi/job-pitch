//
//  EmployeeDetailsController.swift
//  MyJobPitch
//
//  Created by bb on 11/5/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit
import GoogleMaps

class EmployeeDetailsController: MJPController {
    
    @IBOutlet weak var jobTitle: UILabel!
    @IBOutlet weak var jobBusinessLocation: UILabel!
    @IBOutlet weak var jobDescription: UILabel!
    @IBOutlet weak var workplaceDescription: UILabel!
    @IBOutlet weak var mapView: GMSMapView!
    
    public var employee: Employee!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        jobTitle.text = employee.job.title
        jobDescription.text = employee.job.desc
    }
    
    static func instantiate() -> EmployeeDetailsController {
        return AppHelper.instantiate("EmployeeDetails") as! EmployeeDetailsController
    }
}
