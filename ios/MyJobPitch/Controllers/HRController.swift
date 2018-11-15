//
//  HRController.swift
//  MyJobPitch
//
//  Created by bb on 11/5/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit
import XLPagerTabStrip

class HRController: ButtonBarPagerTabStripViewController {

    var jobsController: HRJobListController!
    var employeesController: HREmployeeListController!
    var selectedIndex = 0
    
    override func viewDidLoad() {
        
        settings.style.buttonBarItemBackgroundColor = UIColor.clear
        settings.style.buttonBarItemFont = UIFont.systemFont(ofSize: 12, weight: UIFontWeightSemibold)
        settings.style.buttonBarItemLeftRightMargin = 12
        settings.style.selectedBarBackgroundColor = AppData.greenColor
        settings.style.selectedBarHeight = 3
        settings.style.buttonBarBackgroundColor = AppData.darkColor
        
        super.viewDidLoad()
        
        navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: .add, target: self, action: #selector(addAction))
    }
    
    func addAction() {
        if selectedIndex == 0 {
            jobsController.addHRJob()
        } else {
            employeesController.addHREmployee()
        }
    }
    override func updateIndicator(for viewController: PagerTabStripViewController, fromIndex: Int, toIndex: Int, withProgressPercentage progressPercentage: CGFloat, indexWasChanged: Bool) {
        selectedIndex = toIndex
    }
    
    override func viewControllers(for pagerTabStripController: PagerTabStripViewController) -> [UIViewController] {
        
        jobsController = HRJobListController.instantiate()
        employeesController = HREmployeeListController.instantiate()
        
        let controllers: [UIViewController] = [jobsController, employeesController]
        return controllers
    }
    
    static func instantiate() -> HRController {
        return AppHelper.instantiate("HRSystem") as! HRController
    }
}
