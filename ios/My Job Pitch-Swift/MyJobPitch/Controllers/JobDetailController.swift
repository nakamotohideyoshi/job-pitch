//
//  JobDetailController.swift
//  MyJobPitch
//
//  Created by dev on 12/25/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import GoogleMaps

class JobDetailController: MJPController {

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
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        let image = job.getImage()
        if image != nil {
            AppHelper.loadImageURL(imageUrl: (image?.image)!, imageView: imgView, completion: nil)
        } else {
            imgView.image = UIImage(named: "default-logo")
        }
        
        let profile = AppData.profile!
        let location = job.locationData!
        let business = location.businessData!
        let contract = AppData.getContract(job.contract)!
        let hours = AppData.getHours(job.hours)!
        
        jobTitle.text = job.title
        distance.text = AppHelper.distance(latitude1: profile.latitude, longitude1: profile.longitude, latitude2: location.latitude, longitude2: location.longitude)
        
        jobBusinessLocation.text = String(format: "%@: %@",  business.name, location.name)
        
        if contract.id == AppData.getContractByName(Contract.CONTRACT_PERMANENT).id {
            self.attributes.text = String(format: "%@ (%@)", hours.name, contract.shortName)
        } else {
            self.attributes.text = hours.name
        }
        
        self.jobDescription.text = self.job.desc
        self.locationDescription.text = location.desc
        
        if application != nil {
            chooseView.removeFromSuperview()
        } else {
            messageButton.removeFromSuperview()
        }
        
        let marker = GMSMarker()
        marker.map = mapView
        marker.position = CLLocationCoordinate2DMake(location.latitude.doubleValue, location.longitude.doubleValue)
        mapView.camera = GMSCameraPosition.camera(withTarget: marker.position, zoom: 15)
    }
    
    @IBAction func messageAction(_ sender: Any) {
        MessageController.showModal(application: application)
    }
    
    @IBAction func applyAction(_ sender: Any) {
        PopupController.showGreen("Are you sure you want to apply to this job?", ok: "Apply", okCallback: {
            self.chooseDelegate?.apply()
            _ = self.navigationController?.popViewController(animated: true)
        }, cancel: "Cancel", cancelCallback: nil)
    }
    
    @IBAction func removeAction(_ sender: Any) {
        PopupController.showYellow("Are you sure you are not interested in this job?", ok: "I'm Sure", okCallback: {
            self.chooseDelegate?.remove()
            _ = self.navigationController?.popViewController(animated: true)
        }, cancel: "Cancel", cancelCallback: nil)
    }

    static func pushController(job: Job!,
                               application: Application!,
                               chooseDelegate: ChooseDelegate!) {
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "JobDetail") as! JobDetailController
        controller.job = job
        controller.application = application
        controller.chooseDelegate = chooseDelegate
        AppHelper.getFrontController().navigationController?.pushViewController(controller, animated: true)
        
    }

}
