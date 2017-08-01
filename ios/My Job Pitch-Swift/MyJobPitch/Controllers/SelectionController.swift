//
//  SelectController.swift
//  MyJobPitch
//
//  Created by dev on 12/27/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import STPopup

class SelectionController: UIViewController {
    
    @IBOutlet weak var searchBar: UISearchBar!
    @IBOutlet weak var tableView: UITableView!
    
    var items0: [String]!
    var items = [String]()
    var selectedItems = [String]()
    var multiSelection = false
    var doneCallback: (([String]) -> Void)!
    var searchEnable = true
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Uncomment the following line to preserve selection between presentations
        
        let tap = UITapGestureRecognizer(target: self, action: #selector(close))
        popupController?.backgroundView?.addGestureRecognizer(tap)
        popupController?.navigationBar.barTintColor = AppData.navColor
        popupController?.navigationBar.tintColor = UIColor.white
        popupController?.navigationBar.titleTextAttributes = [NSForegroundColorAttributeName: UIColor.white]
        
        if !searchEnable {
            searchBar.removeFromSuperview()
        } else {
            searchBar.delegate = self
        }
        
        filterItems("")
    }
    
    func filterItems(_ key: String!) {
        items.removeAll()
        for item in items0 {
            if key.isEmpty || item.lowercased().range(of:key.lowercased()) != nil {
                items.append(item)
            }
        }
        tableView.reloadData()
    }
   
    func close() {
        dismiss(animated: true, completion: nil)
    }
    
    @IBAction func doneAction(_ sender: Any) {
        doneCallback?(selectedItems)
        close()
    }
    
    static func showPopup(title: String,
                          items: [String],
                          selectedItems: [String],
                          multiSelection: Bool,
                          search: Bool,
                          doneCallback: (([String]) -> Void)!) {
        
        let frontController = AppHelper.getFrontController()
        frontController?.view.endEditing(true)
        
        let selectionController = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Selection") as! SelectionController
        selectionController.items0 = items
        selectionController.selectedItems.append(contentsOf: selectedItems)
        selectionController.multiSelection = multiSelection
        selectionController.searchEnable = search
        selectionController.doneCallback = doneCallback
        selectionController.navigationItem.title = title

        let popupController = STPopupController(rootViewController: selectionController)
        popupController.style = STPopupStyle.bottomSheet
        popupController.present(in: frontController!)
        
    }
    
}

extension SelectionController: UISearchBarDelegate {
    func searchBar(_ searchBar: UISearchBar, textDidChange searchText: String) {
        filterItems(searchText)
    }
}

extension SelectionController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return items.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "SelectionCell", for: indexPath)
        
        let item = items[indexPath.row]
        cell.textLabel?.text = item
        cell.accessoryType = selectedItems.contains(item) ? .checkmark : .none
        
        return cell
        
    }
    
}

extension SelectionController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
        if !multiSelection {
            selectedItems.removeAll()
        }
        
        let item = items[indexPath.row]
        if selectedItems.contains(item) {
            selectedItems.remove(at: selectedItems.index(of: item)!)
        } else {
            selectedItems.append(item)
        }
        
        tableView.reloadData()
    }
    
}
