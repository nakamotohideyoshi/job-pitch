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

    @IBOutlet weak var carousel: iCarousel!
    @IBOutlet weak var pageControl: UIPageControl!
    @IBOutlet weak var jobTitle: UILabel!
    @IBOutlet weak var jobBusinessLocation: UILabel!
    @IBOutlet weak var contractLabel: UILabel!
    @IBOutlet weak var hoursLabel: UILabel!
    @IBOutlet weak var distanceLabel: UILabel!
    @IBOutlet weak var removeView: UIView!
    @IBOutlet weak var applyView: UIView!
    @IBOutlet weak var acceptView: UIView!
    @IBOutlet weak var messagesBtnView: UIView!
    @IBOutlet weak var jobDescription: UILabel!
    @IBOutlet weak var locationDescription: UILabel!
    @IBOutlet weak var mapView: GMSMapView!
    
    var job: Job!
    var application: Application!
    var interview: ApplicationInterview!
    var controlDelegate: ControlDelegate!
    var jobSeeker: JobSeeker!
    var profile: Profile!
    var viewMode = false
    
    var resources = [MediaModel]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if AppData.user.jobSeeker != nil {

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
    
    func loadData() {
        
        if application != nil {
            job = application.job
        }
        interview = AppHelper.getInterview(application)
        
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
        
        contractLabel.text = AppData.getContract(job.contract).name
        hoursLabel.text = AppData.getHours(job.hours).name
        distanceLabel.text = AppHelper.distance(latitude1: profile.latitude, longitude1: profile.longitude, latitude2: workplace.latitude, longitude2: workplace.longitude)
        distanceLabel.isHidden = application == nil

        jobDescription.text = job.desc
        locationDescription.text = workplace.desc
        
        applyView.isHidden = viewMode || application != nil
        removeView.isHidden = viewMode || application != nil
        acceptView.isHidden = viewMode || interview == nil || interview.status != InterviewStatus.INTERVIEW_PENDING
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
    }
    
    func updateApplication(_ close: Bool) {
        AppData.updateApplication(application.id, success: { (application) in
            if close {
                self.popController()
            } else {
                self.application = application
                self.loadData()
                self.hideLoading()
            }
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
    
    @IBAction func acceptAction(_ sender: Any) {
        PopupController.showYellow("Are you sure you want to accept this interview?", ok: "Ok", okCallback: {
            self.showLoading()
            API.shared().changeInterview(interviewId: self.interview.id, type: "accept", success: { (_) in
                AppData.updateApplication(self.application.id, success: { (application) in
                    self.application = application
                    self.loadData()
                    self.hideLoading()
                }, failure: self.handleErrors)
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
            mediaView = MediaView.instantiate(carousel.bounds)
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
