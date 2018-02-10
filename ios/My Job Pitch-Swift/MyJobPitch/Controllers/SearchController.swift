//
//  SearchController.swift
//  MyJobPitch
//
//  Created by dev on 12/26/16.
//  Copyright © 2016 myjobpitch. All rights reserved.
//

import UIKit

class SearchController: MJPController {
    
    @IBOutlet weak var tableView: UITableView!
    
    var allData: NSMutableArray!
    var data: NSMutableArray!
    var selectedItem: Any!
    
    var navTitleView: UIView!
    var searchItem: UIBarButtonItem!
    var searchBar: UISearchBar!

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        
        data = NSMutableArray();
        
        navTitleView = navigationItem.titleView
        
        searchItem = UIBarButtonItem(barButtonSystemItem: .search, target: self, action: #selector(searchAction))
        navigationItem.rightBarButtonItem = searchItem
        searchBar = UISearchBar()
        searchBar.delegate = self
        searchBar.showsCancelButton = true
        searchBar.alpha = 0        
    }
    
    func filterItem(item: Any, text: String) -> Bool {
        return true;
    }
    
    func filter() {
        if searchBar.text == "" {
            data = allData
        } else {
            let str = searchBar.text?.lowercased()
            data = NSMutableArray()
            for item in allData {
                if filterItem(item: item, text: str!) {
                    data.add(item)
                }
            }
        }
        tableView.reloadData()
    }
    
    func searchAction(_ sender: Any) {
        
        self.navigationItem.rightBarButtonItem = nil
        
        UIView.animate(withDuration: 0.3, animations: {
            self.navTitleView?.alpha = 0
        }) { (finished) in
            self.navigationItem.titleView = self.searchBar
            
            UIView.animate(withDuration: 0.3, animations: {
                self.searchBar.alpha = 1
            }) { (finished) in
                self.searchBar.becomeFirstResponder()
            }
        }
    }
    
    func removeItem(_ item: Any!) {
        
        if item != nil {
            data.remove(item)
            allData.remove(item)
            tableView.reloadData()
        }
        
    }
    
}

extension SearchController: UISearchBarDelegate {
    
    func searchBar(_ searchBar: UISearchBar, textDidChange searchText: String) {
        filter()
    }
    
    func searchBarCancelButtonClicked(_ searchBar: UISearchBar) {
        
        searchBar.text = ""
        self.searchBar(searchBar, textDidChange: "")
        
        UIView.animate(withDuration: 0.3, animations: {
            self.searchBar.alpha = 0
        }) { (finished) in
            self.navigationItem.titleView = self.navTitleView
            self.navigationItem.rightBarButtonItem = self.searchItem
            
            UIView.animate(withDuration: 0.3, animations: {
                self.navTitleView?.alpha = 1
            })
        }
        
    }
    
}
