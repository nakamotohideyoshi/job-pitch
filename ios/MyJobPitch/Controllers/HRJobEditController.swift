//
//  HRJobEditController.swift
//  MyJobPitch
//
//  Created by bb on 11/5/18.
//  Copyright © 2018 myjobpitch. All rights reserved.
//

import UIKit

class HRJobEditController: MJPController {

    @IBOutlet weak var workplaceView: ButtonTextField!
    @IBOutlet weak var workplaceErrorView: UILabel!
    @IBOutlet weak var titleView: UITextField!
    @IBOutlet weak var titleErrorView: UILabel!
    @IBOutlet weak var descriptionView: BorderTextView!
    @IBOutlet weak var descriptionErrorView: UILabel!
    
    public var job: HRJob!
    
    var workplaceNames = [String]()
    var selectedWorkplaceNames = [String]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        title = job == nil ? "Add Job" : "Edit Job"
        isModal = true
        
        workplaceNames = AppData.workplaces.map { $0.name }
        workplaceView.clickCallback = {
            SelectionController.showPopup(title: "",
                                          items: self.workplaceNames,
                                          selectedItems: self.selectedWorkplaceNames,
                                          multiSelection: false,
                                          search: false,
                                          doneCallback: { (items) in
                                            self.selectedWorkplaceNames = items
                                            self.workplaceView.text = items.joined(separator: ", ")
            })
        }
        
        if job != nil {
            titleView.text = job.title
            descriptionView.text = job.desc
            selectedWorkplaceNames = (AppData.workplaces.filter { $0.id == job.location }).map { $0.name }
            workplaceView.text = selectedWorkplaceNames.joined(separator: ", ")
        }
    }
    
    override func getRequiredFields() -> [String: (UIView, UILabel)] {
        return [
            "title":    (titleView, titleErrorView),
            "description":    (descriptionView, descriptionErrorView),
            "workplace":    (workplaceView, workplaceErrorView),
        ]
    }
    
    @IBAction func saveAction(_ sender: Any) {
        if !valid() {
            return
        }
        
        showLoading()
        
        let newJob = HRJob()
        newJob.id = job?.id
        newJob.title = titleView.text?.trimmingCharacters(in: .whitespacesAndNewlines)
        newJob.desc = descriptionView.text?.trimmingCharacters(in: .whitespacesAndNewlines)
        
        let workplaces = (AppData.workplaces.filter { selectedWorkplaceNames.contains($0.name) }).map { $0.id }
        if workplaces.count != 0 {
            newJob.location = workplaces[0]
        }
        
        API.shared().saveHRJob(newJob) { (result, error) in
            if error != nil {
                self.handleError(error)
                return
            }
            
            if self.job != nil {
                AppData.hrJobs = AppData.hrJobs.filter { $0.id != self.job.id }
            }
            AppData.hrJobs.insert(result as! HRJob, at: 0)
            
            self.closeController()
        }
    }
    
    static func instantiate() -> HRJobEditController {
        return AppHelper.instantiate("HRJobEdit") as! HRJobEditController
    }
    
}
