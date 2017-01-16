//
//  SelectController.swift
//  MyJobPitch
//
//  Created by dev on 12/27/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit
import STPopup

class SelectionController: UITableViewController {
    
    var items: [String]!
    var selectedItems = [String]()
    var multiSelection = false
    var doneCallback: (([String]) -> Void)!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Uncomment the following line to preserve selection between presentations
        
        let tap = UITapGestureRecognizer(target: self, action: #selector(close))
        popupController?.backgroundView?.addGestureRecognizer(tap)
        popupController?.navigationBar.barTintColor = AppData.navColor
        popupController?.navigationBar.tintColor = UIColor.white
        popupController?.navigationBar.titleTextAttributes = [NSForegroundColorAttributeName: UIColor.white]
        
    }
    
    // MARK: - Table view data source
    
    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return items.count
    }
    
    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "SelectionCell", for: indexPath)
        
        let item = items[indexPath.row]
        cell.textLabel?.text = item
        cell.accessoryType = selectedItems.contains(item) ? .checkmark : .none
        
        return cell
    }
    
    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
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
                          doneCallback: (([String]) -> Void)!) {
        
        let frontController = AppHelper.getFrontController()
        frontController?.view.endEditing(true)
        
        let selectionController = AppHelper.mainStoryboard.instantiateViewController(withIdentifier: "Selection") as! SelectionController
        selectionController.items = items
        selectionController.selectedItems.append(contentsOf: selectedItems)
        selectionController.multiSelection = multiSelection
        selectionController.doneCallback = doneCallback
        selectionController.navigationItem.title = title

        let popupController = STPopupController(rootViewController: selectionController)
        popupController.style = STPopupStyle.bottomSheet
        popupController.present(in: frontController!)
        
    }
    
}
