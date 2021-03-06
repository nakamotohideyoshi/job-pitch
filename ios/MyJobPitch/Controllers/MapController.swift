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

class MapController: UIViewController {

    @IBOutlet weak var mapView: GMSMapView!
    
    var currentPos: CLLocationCoordinate2D!
    var radius: CLLocationDistance!
    var placeID: String!
    var placeName: String!
    
    var complete: ((CLLocationCoordinate2D, String?, String?, String?, String?, String?, String?) -> Void)!
    
    var searchController: UISearchController!
    var myPos: CLLocationCoordinate2D!
    
    var marker: GMSMarker!
    var circ: GMSCircle!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        mapView.delegate = self
        mapView.isMyLocationEnabled = true
        mapView.settings.myLocationButton = true
        mapView.addObserver(self, forKeyPath: "myLocation", options: NSKeyValueObservingOptions.new, context: nil)
        
        marker = GMSMarker()
        marker.map = mapView
        
        if currentPos != nil {
            updatePosition(currentPos)
            mapView.camera = GMSCameraPosition.camera(withTarget: currentPos, zoom: getZoom())
        }
        
        PopupController.showGray(NSLocalizedString("Tap on the city or location that you would like to set and tap \"select\" on the upper right corner", comment: ""),
                                 ok: NSLocalizedString("Got it!", comment: ""))
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
        marker.position = position
        
        if radius != nil {
            if circ == nil {
                circ = GMSCircle(position: currentPos!, radius: radius)
                circ.fillColor = UIColor(red: 1, green: 147/255.0, blue: 0, alpha: 0.2)
                circ.strokeColor = UIColor(red: 0, green: 182/255.0, blue: 164/255.0, alpha: 1)
                circ.strokeWidth = 2
                circ.map = mapView
            }
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
    
        let loading = LoadingController()
        loading.addToView(parentView: view)
        loading.indicatorView.isHidden = false
        loading.view.backgroundColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.5)
        
        GMSGeocoder().reverseGeocodeCoordinate(currentPos) { (response, error) in
            
            loading.view.removeFromSuperview()
            
            var country: String? = nil
            var region: String? = nil
            var city: String? = nil
            var street: String? = nil
            var postcode: String? = nil
            var line: String? = nil
            
            if let address = response?.firstResult() {
                country = address.country
                region = address.administrativeArea
                city = address.locality
                street = address.thoroughfare
                postcode = address.postalCode
                line = address.lines![0]
                if street == nil {
                    let arr = line?.components(separatedBy: ", ")
                    if (arr?.count)! > 4 {
                        street = arr?[0]
                    }
                }
            }
            
            self.dismiss(animated: true, completion: {
                self.complete?(self.currentPos, country, region, city, street, postcode, line)
            })
        }
    }

    @IBAction func cancelAction(_ sender: Any) {
        dismiss(animated: true, completion: nil)
    }
    
    static func instantiate() -> MapController {
        return AppHelper.instantiate("MapController") as! MapController
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
