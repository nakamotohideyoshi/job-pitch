//
//  ApplicationDetailController.swift
//  MyJobPitch
//
//  Created by dev on 12/25/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import GoogleMaps
import JTSImageViewController

class ApplicationDetailController: MJPController {

    @IBOutlet weak var imgView: UIImageView!
    @IBOutlet weak var jobTitle: UILabel!
    @IBOutlet weak var distance: UILabel!
    @IBOutlet weak var jobBusinessLocation: UILabel!
    @IBOutlet weak var attributes: UILabel!
    @IBOutlet weak var jobDescription: UILabel!
    @IBOutlet weak var locationDescription: UILabel!
    @IBOutlet weak var mapView: GMSMapView!
    @IBOutlet weak var messageButton: RoundButton!
    @IBOutlet weak var chooseView: UIView!
    
    var job: Job!
    var application: Application!
    var chooseDelegate: ChooseDelegate!
    var onlyView = false
    
    var jobSeeker: JobSeeker!
    var profile: Profile!
    
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
        
        let image = job.getImage()
        if image != nil {
            AppHelper.loadImageURL(imageUrl: (image?.image)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        
        let location = job.locationData!
        let contract = AppData.getContract(job.contract)!
        let hours = AppData.getHours(job.hours)!
        
        jobTitle.text = job.title
        distance.text = AppHelper.distance(latitude1: profile.latitude, longitude1: profile.longitude, latitude2: location.latitude, longitude2: location.longitude)
        
        jobBusinessLocation.text = job.getBusinessName()
        
        if contract.id == AppData.getContractByName(Contract.CONTRACT_PERMANENT).id {
            attributes.text = String(format: "%@ (%@)", hours.name, contract.shortName)
        } else {
            attributes.text = hours.name
        }
        
        jobDescription.text = job.desc
        locationDescription.text = location.desc
        
        if application != nil || onlyView {
            chooseView.removeFromSuperview()
        }
        if application == nil || onlyView {
            messageButton.removeFromSuperview()
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
    }
    
    @IBAction func imageClickAction(_ sender: Any) {
    
        let imageInfo = JTSImageInfo()
        imageInfo.referenceRect = imgView.frame
        imageInfo.referenceView = view
        
        let image = job.getImage()
        if image != nil {
            imageInfo.imageURL = URL(string: (image?.image)!)
        } else {
            imageInfo.image = UIImage(named: "default-logo")
        }
        
        let imageViewer = JTSImageViewController.init(imageInfo: imageInfo, mode: .image, backgroundStyle: .init(rawValue: 0))
        imageViewer?.show(from: self, transition: .fromOriginalPosition)
        
    }
    
    @IBAction func messageAction(_ sender: Any) {
        MessageController0.showModal(application: application)
    }
    
    @IBAction func applyAction(_ sender: Any) {
        PopupController.showGreen("Are you sure you want to apply to this job?", ok: "Apply", okCallback: {
            self.showLoading()
            self.chooseDelegate?.apply(callback: {
                _ = self.navigationController?.popViewController(animated: true)
            })
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func removeAction(_ sender: Any) {
        PopupController.showYellow("Are you sure you are not interested in this job?", ok: "I'm Sure", okCallback: {
            _ = self.navigationController?.popViewController(animated: true)
            self.chooseDelegate?.remove()
        }, cancel: "Cancel", cancelCallback: nil)
    }

    static func pushController(job: Job!,
                               application: Application!,
                               chooseDelegate: ChooseDelegate!) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "ApplicationDetail") as! ApplicationDetailController
        controller.job = job
        controller.application = application
        controller.chooseDelegate = chooseDelegate
        AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
    }

}
