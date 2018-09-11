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

    @IBOutlet weak var jobTitle: UILabel!
    @IBOutlet weak var jobBusinessLocation: UILabel!
    @IBOutlet weak var contractLabel: UILabel!
    @IBOutlet weak var hoursLabel: UILabel!
    @IBOutlet weak var distanceLabel: UILabel!
    @IBOutlet weak var removeView: UIView!
    @IBOutlet weak var applyView: UIView!
    @IBOutlet weak var messagesBtnView: UIView!
    @IBOutlet weak var jobDescription: UILabel!
    @IBOutlet weak var locationDescription: UILabel!
    @IBOutlet weak var mapView: GMSMapView!
    @IBOutlet weak var carousel: iCarousel!
    @IBOutlet weak var pageControl: UIPageControl!
    
    var job: Job!
    var application: Application!
    var chooseDelegate: ChooseDelegate!
    var onlyView = false
    
    var jobSeeker: JobSeeker!
    var profile: Profile!
    
    var resources = Array<JobResourceModel>()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        scrollView.isHidden = true
        
        if application != nil {
            job = application.job
        }
        
        showLoading()
        API.shared().loadJobSeekerWithId(id: AppData.user.jobSeeker, success: { (data) in
            self.jobSeeker = data as! JobSeeker
            API.shared().loadJobProfileWithId(id: self.jobSeeker.profile, success: { (data) in
                self.hideLoading()
                self.scrollView.isHidden = false
                
                self.profile = data as! Profile
                self.load()
            }, failure: self.handleErrors)
        }, failure: self.handleErrors)
        
    }
    
    func load() {
        
        let pitch = job.getPitch()
        if pitch != nil {
            let resource = JobResourceModel()
            resource.thumbnail = pitch?.thumbnail
            resource.video = pitch?.video
            resources.append(resource)
        }
        
        let logoModel = JobResourceModel()
        logoModel.defaultImage = UIImage(named: "default-logo")
        let image = job.getImage()
        if image != nil {
            logoModel.thumbnail = image?.thumbnail
            logoModel.image = image?.image
        }
        resources.append(logoModel)
        
        let location = job.locationData!
        let contract = AppData.getContract(job.contract)!
        let hours = AppData.getHours(job.hours)!
        
        jobTitle.text = job.title
        jobBusinessLocation.text = job.getBusinessName()
        
        distanceLabel.text = AppHelper.distance(latitude1: profile.latitude, longitude1: profile.longitude, latitude2: location.latitude, longitude2: location.longitude)
        
        contractLabel.text = contract.name
        hoursLabel.text = hours.name
        
        jobDescription.text = job.desc
        locationDescription.text = location.desc
        
        if application != nil || onlyView {
            removeView.removeFromSuperview()
            applyView.removeFromSuperview()
        }
        if application == nil || onlyView {
            messagesBtnView.isHidden = true
        }
        
        var position = CLLocationCoordinate2DMake(location.latitude.doubleValue, location.longitude.doubleValue)
        if (application != nil) {
            let marker = GMSMarker()
            marker.map = mapView
            marker.position = position
            mapView.camera = GMSCameraPosition.camera(withTarget: marker.position, zoom: 15)
        } else {
            let alpha = 2 * Double.pi * drand48();
            let rand = drand48();
            position.latitude += 0.00434195349206 * cos(alpha) * rand;
            position.longitude += 0.00528038212262 * sin(alpha) * rand;
            
            let circ = GMSCircle(position: position, radius: 482.8)
            circ.fillColor = UIColor(red: 1, green: 147/255.0, blue: 0, alpha: 0.2)
            circ.strokeColor = UIColor(red: 0, green: 182/255.0, blue: 164/255.0, alpha: 1)
            circ.strokeWidth = 2
            circ.map = mapView
        }
        mapView.camera = GMSCameraPosition.camera(withTarget: position, zoom: 14)
        
        pageControl.numberOfPages = resources.count
        if resources.count < 2 {
            pageControl.isHidden = true
        }
        carousel.bounces = false
        carousel.reloadData()
    }
    
    @IBAction func removeAction(_ sender: Any) {
        PopupController.showYellow("Are you sure you are not interested in this job?", ok: "I'm Sure", okCallback: {
            _ = self.navigationController?.popViewController(animated: true)
            self.chooseDelegate?.remove()
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func applyAction(_ sender: Any) {
        PopupController.showGreen("Are you sure you want to apply to this job?", ok: "Apply", okCallback: {
            self.showLoading()
            self.chooseDelegate?.apply(callback: {
                _ = self.navigationController?.popViewController(animated: true)
            })
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func messageAction(_ sender: Any) {
        if AppData.user.isJobSeeker() {
            if (!jobSeeker.active) {
                PopupController.showGreen("To message please active your account", ok: "activate", okCallback: {
                    let controller = AppHelper.instantiate("JobSeekerProfile") as! JobSeekerProfileController
                    controller.activation = true
                    AppHelper.getFrontController().navigationController?.present(controller, animated: true)
                }, cancel: "Cancel", cancelCallback: nil)
                return
            }
        }
        let controller = MessageController0.instantiate()
        controller.application = application
        let navController = UINavigationController(rootViewController: controller)
        present(navController, animated: true, completion: nil)
    }
    
    @IBAction func shareAction(_ sender: Any) {
        let url = String(format: "%@/jobseeker/jobs/%d", API.apiRoot.absoluteString, job.id)
        let itemProvider = ShareProvider(placeholderItem: url)
        let controller = UIActivityViewController(activityItems: [itemProvider], applicationActivities: nil)
        present(controller, animated: true, completion: nil)
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
        //create new view if no view is available for recycling
        var jobResource: JobResource!
        if view == nil {
            jobResource = JobResource.instanceFromNib(carousel.bounds)
            jobResource.controller = self
        } else {
            jobResource = view as! JobResource
        }
        
        jobResource.model = resources[index]
        return jobResource
    }
    
}

extension ApplicationDetailsController: iCarouselDelegate {
    func carouselCurrentItemIndexDidChange(_ carousel: iCarousel) {
        pageControl.currentPage = carousel.currentItemIndex
    }
    
}
