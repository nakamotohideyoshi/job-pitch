//
//  ApplicationDetailsController.swift
//  MyJobPitch
//
//  Created by dev on 12/25/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import GoogleMaps

class ApplicationDetailsController: MJPController {

    @IBOutlet weak var mainView: UIStackView!
    @IBOutlet weak var tableView: UITableView!
    
    @IBOutlet weak var carousel: iCarousel!
    @IBOutlet weak var pageControl: UIPageControl!
    @IBOutlet weak var jobTitle: UILabel!
    @IBOutlet weak var jobBusinessLocation: UILabel!
    @IBOutlet weak var contractLabel: UILabel!
    @IBOutlet weak var hoursLabel: UILabel!
    @IBOutlet weak var distanceLabel: UILabel!
    @IBOutlet weak var removeView: UIView!
    @IBOutlet weak var applyView: UIView!
    @IBOutlet weak var interviewInfo: InterviewView!
    @IBOutlet weak var messagesBtnView: UIView!
    @IBOutlet weak var badge: BadgeIcon!
    @IBOutlet weak var jobDescription: UILabel!
    @IBOutlet weak var locationDescription: UILabel!
    @IBOutlet weak var mapView: GMSMapView!
    @IBOutlet weak var historyTitleView: UIView!
    
    public var job: Job!
    public var application: Application!
    public var viewMode = false
    public var controlDelegate: ControlDelegate!
    
    var interview: Interview!
    var interviews = [Interview]()
    
    var jobSeeker: JobSeeker!
    var profile: Profile!
    
    var resources = [MediaModel]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if AppData.user.isJobSeeker() {

            showLoading()

            API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
                self.jobSeeker = data as! JobSeeker
                API.shared().loadJobProfileWithId(id: self.jobSeeker.profile, success: { (data) in
                    self.hideLoading()
                    self.profile = data as! Profile
                    self.loadData()
                }, failure: self.handleErrors)
            }, failure: self.handleErrors)
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        AppData.appsUpdateCallback = {
            self.loadData()
        }
        
        loadData()
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        AppData.appsUpdateCallback = nil
    }
    
    func loadData() {
        
        if AppData.user.isJobSeeker() && profile == nil {
            return
        }
        
        if application != nil {
            application = (AppData.applications.filter { $0.id == application.id })[0]
            interview = application?.getInterview()
            interviews = (application.interviews as! [Interview]).filter { $0.id != interview?.id }
            job = application.job
            
            let newMsgs = application.getNewMessageCount()
            badge.text = "\(newMsgs)"
            badge.isHidden = newMsgs == 0
        } else {
            interview = nil
        }
        
        resources.removeAll()
        if let pitch = job.getPitch() {
            let resource = MediaModel()
            resource.thumbnail = pitch.thumbnail
            resource.video = pitch.video
            resources.append(resource)
        }
        
        let image = job.getImage()
        let logoModel = MediaModel()
        logoModel.thumbnail = image?.thumbnail
        logoModel.image = image?.image
        logoModel.defaultImage = UIImage(named: "default-logo")
        resources.append(logoModel)
        
        jobTitle.text = job.title
        jobBusinessLocation.text = job.getBusinessName()
        let workplace = job.locationData!
        
        contractLabel.text = AppData.getNameByID(AppData.contracts, id: job.contract)
        hoursLabel.text = AppData.getNameByID(AppData.hours, id: job.hours)
        distanceLabel.text = AppHelper.distance(latitude1: profile.latitude, longitude1: profile.longitude, latitude2: workplace.latitude, longitude2: workplace.longitude)
        distanceLabel.isHidden = application == nil

        interviewInfo.superview?.isHidden = interview == nil
        if (interview != nil) {
            interviewInfo.interview = interview
            interviewInfo.application = application
            interviewInfo.acceptCallback = acceptAction
            interviewInfo.cancelCallback = cancelInterview
        }
        
        jobDescription.text = job.desc
        locationDescription.text = workplace.desc
        
        applyView.isHidden = viewMode || application != nil
        removeView.isHidden = viewMode || application != nil
        messagesBtnView.isHidden = viewMode || application == nil
        
        var position = CLLocationCoordinate2DMake(workplace.latitude.doubleValue, workplace.longitude.doubleValue)
        if (application == nil) {
            let alpha = 2 * Double.pi * drand48();
            let rand = drand48();
            position.latitude += 0.00434195349206 * cos(alpha) * rand;
            position.longitude += 0.00528038212262 * sin(alpha) * rand;
            
            let circ = GMSCircle(position: position, radius: 482.8)
            circ.fillColor = UIColor(red: 1, green: 147/255.0, blue: 0, alpha: 0.2)
            circ.strokeColor = UIColor(red: 0, green: 182/255.0, blue: 164/255.0, alpha: 1)
            circ.strokeWidth = 2
            circ.map = mapView
        } else {
            let marker = GMSMarker()
            marker.map = mapView
            marker.position = position
            mapView.camera = GMSCameraPosition.camera(withTarget: marker.position, zoom: 15)
        }
        mapView.camera = GMSCameraPosition.camera(withTarget: position, zoom: 14)
        
        pageControl.numberOfPages = resources.count
        pageControl.isHidden = resources.count <= 1
        
        carousel.bounces = false
        carousel.reloadData()
        
        historyTitleView.isHidden = interviews.count == 0
        
        mainView.layoutIfNeeded()
        mainView.sizeToFit()
        mainView.superview?.frame.size.height = mainView.frame.height
        
        tableView.reloadData()
    }
    
    func updateApplication() {
        AppData.getApplication(application.id, success: { (application) in
            self.hideLoading()
            self.loadData()
        }, failure: self.handleErrors)
    }
    
    @IBAction func applyAction(_ sender: Any) {
        PopupController.showGreen("Are you sure you want to apply to this job?", ok: "Apply", okCallback: {
            self.showLoading()
            self.controlDelegate.apply(success: { (_) in
                self.popController()
            }, failure: nil)
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func removeAction(_ sender: Any) {
        PopupController.showYellow("Are you sure you are not interested in this job?", ok: "I'm Sure", okCallback: {
            self.showLoading()
            self.controlDelegate.remove(success: { (_) in
                self.popController()
            }, failure: nil)
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    func acceptAction() {
        PopupController.showYellow("Are you sure you want to accept this interview?", ok: "Ok", okCallback: {
            self.showLoading()
            API.shared().changeInterview(interviewId: self.interview.id, type: "accept", success: { (_) in
                self.updateApplication()
            }, failure: self.handleErrors)
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    func cancelInterview() {
        PopupController.showYellow("Are you sure you want to cancel this interview?", ok: "Ok", okCallback: {
            self.showLoading()
            API.shared().deleteInterview(interviewId: self.interview.id, success: { (_) in
                self.updateApplication()
            }, failure: self.handleErrors)
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func messageAction(_ sender: Any) {
        if jobSeeker != nil && !jobSeeker.active {
            
            PopupController.showGreen("To message please active your account", ok: "activate", okCallback: {
                let controller = JobSeekerProfileController.instantiate()
                self.present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
            }, cancel: "Cancel", cancelCallback: nil)
            
        } else {
        
            let controller = MessageController0.instantiate()
            controller.application = application
            present(UINavigationController(rootViewController: controller), animated: true, completion: nil)
        }
    }
    
    @IBAction func shareAction(_ sender: Any) {
        let url = String(format: "%@/jobseeker/jobs/%d", API.apiRoot.absoluteString, job.id)
        let itemProvider = ShareProvider(placeholderItem: url)
        let controller = UIActivityViewController(activityItems: [itemProvider], applicationActivities: nil)
        present(controller, animated: true, completion: nil)
    }
    
    func popController() {
        _ = self.navigationController?.popViewController(animated: true)
    }
    
    static func instantiate() -> ApplicationDetailsController {
        return AppHelper.instantiate("ApplicationDetails") as! ApplicationDetailsController
    }
    
}

extension ApplicationDetailsController: iCarouselDataSource {
    
    func numberOfItems(in carousel: iCarousel) -> Int {
        return resources.count
    }
    
    func carousel(_ carousel: iCarousel, viewForItemAt index: Int, reusing view: UIView?) -> UIView {

        var mediaView: MediaView!
        if view == nil {
            mediaView = MediaView(frame: carousel.bounds)
            mediaView.controller = self
        } else {
            mediaView = view as! MediaView
        }
        
        mediaView.model = resources[index]
        return mediaView
    }
}

extension ApplicationDetailsController: iCarouselDelegate {
    func carouselCurrentItemIndexDidChange(_ carousel: iCarousel) {
        pageControl.currentPage = carousel.currentItemIndex
    }
    
}

extension ApplicationDetailsController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return interviews.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "InterviewHistoryCell", for: indexPath)
        
        let interview = interviews[indexPath.row]
        var status1 = ""
        if interview.status == InterviewStatus.INTERVIEW_COMPLETED {
            status1 = "Completed"
        } else if interview.status == InterviewStatus.INTERVIEW_CANCELLED {
            status1 = "Cancelled"
        }
        
        (cell.viewWithTag(1) as! UILabel).text = AppHelper.dateToShortString(interview.at)
        (cell.viewWithTag(2) as! UILabel).text = status1
        
        if indexPath.row < interviews.count - 1 {
            cell.drawUnderline()
        }
        
        return cell
    }
}

extension ApplicationDetailsController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let controller = InterviewDetailController.instantiate()
        controller.application = application
        controller.interviewId = interviews[indexPath.row].id
        navigationController?.pushViewController(controller, animated: true)
    }
}
