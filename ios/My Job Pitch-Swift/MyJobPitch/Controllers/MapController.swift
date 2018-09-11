//
//  MapController.swift
//  MyJobPitch
//
//  Created by dev on 12/28/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import GoogleMaps
import GooglePlaces

protocol LocationMapDelegate {
    func selectedLocationMap(_ pos: CLLocationCoordinate2D, placeID: String, placeName: String)
}

class MapController: UIViewController {

    @IBOutlet weak var mapView: GMSMapView!
    
    var currentPos: CLLocationCoordinate2D!
    var radius: CLLocationDistance!
    var placeID: String!
    var placeName: String!
    
    var complete: ((CLLocationCoordinate2D, String, String) -> Void)!
    
    var searchController: UISearchController!
    var myPos: CLLocationCoordinate2D!
    
    var marker: GMSMarker!
    var circ: GMSCircle!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        mapView.delegate = self
        mapView.isMyLocationEnabled = true
        mapView.settings.myLocationButton = true
        mapView.addObserver(self, forKeyPath: "myLocation", options: NSKeyValueObservingOptions.new, context: nil)
        
        if (radius == nil) {
            marker = GMSMarker()
            marker.map = mapView
        }
        
        if currentPos != nil {
            updatePosition(currentPos)
            mapView.camera = GMSCameraPosition.camera(withTarget: currentPos, zoom: getZoom())
        }
    }
    
    func showAlert() {
        let alertController = UIAlertController(title: NSLocalizedString("Alert", comment: ""), message: NSLocalizedString("Access to Your Location required!", comment: ""), preferredStyle: .alert)
        
        let cancelAction = UIAlertAction(title: NSLocalizedString("Cancel", comment: ""), style: .cancel) {
            (UIAlertAction) in
            self.dismiss(animated: true, completion: nil)
        }
        let settingsAction = UIAlertAction(title: NSLocalizedString("Settings", comment: ""), style: .default) { (UIAlertAction) in
            UIApplication.shared.openURL(NSURL(string: UIApplicationOpenSettingsURLString)! as URL)
        }
        
        alertController.addAction(cancelAction)
        alertController.addAction(settingsAction)
        self.present(alertController, animated: true, completion: nil)
    }
    
    func updatePosition(_ position: CLLocationCoordinate2D) {
        
        currentPos = position
        
        if circ == nil && radius != nil {
            circ = GMSCircle(position: currentPos!, radius: radius)
            circ.fillColor = UIColor(red: 1, green: 147/255.0, blue: 0, alpha: 0.2)
            circ.strokeColor = UIColor(red: 0, green: 182/255.0, blue: 164/255.0, alpha: 1)
            circ.strokeWidth = 2
            circ.map = mapView
        }
        
        if (marker != nil) {
            marker.position = position
        } else {
            circ.position = position
        }
    }
    
    func getZoom() -> Float  {
        if (marker != nil) {
            return 14
        }
        if (radius < 2000) {
            return 13
        }
        if (radius < 4000) {
            return 12
        }
        if (radius < 10000) {
            return 11
        }
        if (radius < 20000) {
            return 10
        }
        return 7
    }
    
    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
        
        let location = change?[NSKeyValueChangeKey.newKey] as! CLLocation
        if myPos == nil {
            myPos = location.coordinate
            mapView.removeObserver(self, forKeyPath: "myLocation")
            if currentPos == nil {
                updatePosition(myPos)
                mapView.camera = GMSCameraPosition.camera(withTarget: myPos, zoom: getZoom())
            }
        }
        
    }

    @IBAction func searchAction(_ sender: Any) {
        
        let resultsViewController = GMSAutocompleteResultsViewController()
        resultsViewController.delegate = self
        
        searchController = UISearchController(searchResultsController: resultsViewController)
        searchController.searchResultsUpdater = resultsViewController
        searchController.hidesNavigationBarDuringPresentation = false
        present(searchController, animated: true, completion: nil)
    }
    
    @IBAction func selectAction(_ sender: Any) {
    
        let loadingView = LoadingView.create(controller: self)
        loadingView.backgroundColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.5)
        
        GMSGeocoder().reverseGeocodeCoordinate(currentPos) { (response, error) in
            
            loadingView.removeFromSuperview()
            
            var address = "address unknown"
            if let firstAddress = response?.firstResult() {
                let lines = firstAddress.lines!
                if lines.count > 1 {
                    address = ""
                    let line = lines[0]
                    if line != "" {
                        address = line
                    }
                }
            }
            
            self.dismiss(animated: true, completion: {
                self.complete?(self.currentPos, "", address)
            })
            
        }
    }

    @IBAction func cancelAction(_ sender: Any) {
        dismiss(animated: true, completion: nil)
    }
    
    static func showModal(latitude: NSNumber!, longitude: NSNumber!, radius: CLLocationDistance!,
                          complete: ((CLLocationCoordinate2D, String, String) -> Void)!) {
        
        let controller = AppHelper.instantiate("MapController") as! MapController
        if latitude != nil {
            controller.currentPos = CLLocationCoordinate2DMake(latitude as CLLocationDegrees, longitude as CLLocationDegrees)
        }
        controller.radius = radius;
        controller.complete = complete
        
        let navController = UINavigationController(rootViewController: controller)
        
        AppHelper.getFrontController().present(navController, animated: true, completion: nil)
    }
    
}

extension MapController: GMSMapViewDelegate {
    
    func mapView(_ mapView: GMSMapView, didTapAt coordinate: CLLocationCoordinate2D) {
        updatePosition(coordinate)
    }
    
}

extension MapController: GMSAutocompleteResultsViewControllerDelegate {
    
    func resultsController(_ resultsController: GMSAutocompleteResultsViewController, didAutocompleteWith place: GMSPlace) {
        updatePosition(place.coordinate)
        mapView.camera = GMSCameraPosition.camera(withTarget: currentPos, zoom: getZoom())
        searchController.dismiss(animated: true, completion: nil)
    }
    
    func resultsController(_ resultsController: GMSAutocompleteResultsViewController, didFailAutocompleteWithError error: Error) {
        searchController.dismiss(animated: true, completion: nil)
    }
    
    func didRequestAutocompletePredictions(forResultsController resultsController: GMSAutocompleteResultsViewController) {
        UIApplication.shared.isNetworkActivityIndicatorVisible = true
    }
    
    func didUpdateAutocompletePredictions(forResultsController resultsController: GMSAutocompleteResultsViewController) {
        UIApplication.shared.isNetworkActivityIndicatorVisible = false
    }
    
}
