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
    var placeID: String!
    var placeName: String!
    
    var complete: ((CLLocationCoordinate2D, String, String) -> Void)!
    
    var searchController: UISearchController!
    var myPos: CLLocationCoordinate2D!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        mapView.delegate = self
        mapView.isMyLocationEnabled = true
        mapView.settings.myLocationButton = true
        mapView.addObserver(self, forKeyPath: "myLocation", options: NSKeyValueObservingOptions.new, context: nil)
        
        if currentPos != nil {
            mapView.camera = GMSCameraPosition.camera(withTarget: currentPos, zoom: 14)
        }
                
    }
    
    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
        
        let location = change?[NSKeyValueChangeKey.newKey] as! CLLocation
        if myPos == nil {
            myPos = location.coordinate
            mapView.removeObserver(self, forKeyPath: "myLocation")
            if currentPos == nil {
                mapView.camera = GMSCameraPosition.camera(withTarget: myPos, zoom: 14)
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
    
        AppHelper.showLoading("")
        
        GMSGeocoder().reverseGeocodeCoordinate(currentPos) { (response, error) in
            AppHelper.hideLoading()
            
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
            
            self.complete?(self.currentPos, "", address)
            self.dismiss(animated: true, completion: nil)
            
        }
    }

    @IBAction func cancelAction(_ sender: Any) {
        dismiss(animated: true, completion: nil)
    }
    
    static func showModal(latitude: NSNumber!, longitude: NSNumber!,
                          complete: ((CLLocationCoordinate2D, String, String) -> Void)!) {
        
        let controller = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "MapController") as! MapController
        if latitude != nil {
            controller.currentPos = CLLocationCoordinate2DMake(latitude as CLLocationDegrees, longitude as CLLocationDegrees)
        }
        controller.complete = complete
        
        let navController = UINavigationController(rootViewController: controller)
        
        AppHelper.getFrontController().present(navController, animated: true, completion: nil)
    }
    
}

extension MapController: GMSMapViewDelegate {
    
    func mapView(_ mapView: GMSMapView, idleAt position: GMSCameraPosition) {
        currentPos = position.target
    }
    
}

extension MapController: GMSAutocompleteResultsViewControllerDelegate {
    
    func resultsController(_ resultsController: GMSAutocompleteResultsViewController, didAutocompleteWith place: GMSPlace) {
        mapView.camera = GMSCameraPosition.camera(withTarget: place.coordinate, zoom: 14)
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
