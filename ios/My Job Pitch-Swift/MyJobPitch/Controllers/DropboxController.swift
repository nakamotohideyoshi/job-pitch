//
//  DropboxController.swift
//  MyJobPitch
//
//  Created by dev on 6/19/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit
import SwiftyDropbox
import SVPullToRefresh

class DropboxController: UIViewController {
    
    @IBOutlet weak var tableView: UITableView!
    
    var files = Array<Files.Metadata>()
    var arrPath: [String]!
    var downloadCallback: ((String, String) -> Void)!
    
    override func viewDidLoad() {

        super.viewDidLoad()

        tableView.addPullToRefresh {
            if let _ = DropboxClientsManager.authorizedClient {
                self.getFiles()
            } else {
                self.tableView.pullToRefreshView.stopAnimating()
            }
        }
        tableView.addInfiniteScrolling {
            self.tableView.infiniteScrollingView.stopAnimating()
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {

        if let _ = DropboxClientsManager.authorizedClient {
            if navigationItem.rightBarButtonItem?.title == "Sign in" {
                navigationItem.rightBarButtonItem?.title = "Sign out"
                arrPath = [""]
                
                tableView.infiniteScrollingView.startAnimating()
                getFiles()
            }
        }
    }
    
    func getFiles() {
        
        files.removeAll()
        tableView.reloadData()
        
        _ = DropboxClientsManager.authorizedClient?.files.listFolder(path: arrPath.joined(separator: "/")).response { response, error in
            
            // back item

            if self.arrPath.count > 1 {
                let back = Files.FolderMetadata(name: "..", id: "back")
                self.files.append(back)
            }

            // get metadatas

            if let result = response {
                for metadata in result.entries {
                    self.files.append(metadata)
                }
            } else {
                print("Error: \(error!)")
            }

            // reload
            
            self.tableView.pullToRefreshView.stopAnimating()
            self.tableView.infiniteScrollingView.stopAnimating()
            self.tableView.reloadData()
            
        }
        
    }
    
    func downloadFile(file: Files.FileMetadata) {
        
        AppHelper.showLoading("Downloading...")
        
        let path = "/" + arrPath.joined(separator: "/") + file.name
        let fileManager = FileManager.default
        let directoryURL = fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let destURL = directoryURL.appendingPathComponent(file.name)
        let destination: (URL, HTTPURLResponse) -> URL = { temporaryURL, response in
            return destURL
        }
        
        DropboxClientsManager.authorizedClient?.files.download(path: path,
                                                               overwrite: true,
                                                               destination: destination)
            .response { response, error in
                AppHelper.hideLoading()
                if let _ = response {
                    self.dismiss(animated: true, completion: {
                        let path = destURL.absoluteString.replacingOccurrences(of: "file://", with: "")
                        self.downloadCallback?(path, file.name)
                    })
                } else if let error = error {
                    print(error)
                }
            }

    }

    @IBAction func signAction(_ sender: Any) {

        if let _ = DropboxClientsManager.authorizedClient {

            DropboxClientsManager.unlinkClients()
            navigationItem.rightBarButtonItem?.title = "Sign in"
            files.removeAll()
            tableView.reloadData()

        } else {

            DropboxClientsManager.authorizeFromController(UIApplication.shared,
                                                          controller: self,
                                                          openURL: { (url: URL) -> Void in UIApplication.shared.openURL(url) })
        
        }
        
    }
    
    @IBAction func cancelAction(_ sender: Any) {
        dismiss(animated: true, completion: nil)
    }
    
}

extension DropboxController: UITableViewDataSource {

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return files.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {

        let cell = tableView.dequeueReusableCell(withIdentifier: "FileCell", for: indexPath) as! FileCell
        let metadata = files[indexPath.row]
        
        // get icon
        
        var iconName = "d_file"
        if let _ = metadata as? Files.FolderMetadata {
            iconName = "d_folder"
        } else {
            let name = metadata.name.lowercased()
            if name.hasSuffix(".jpg") || name.hasSuffix(".png") {
                iconName = "d_image"
            } else if name.hasSuffix(".pdf") {
                iconName = "d_pdf"
            }
        }
        cell.imgView.image = UIImage(named: iconName)
        
        // get folder/file name
        
        cell.nameLabel?.text = metadata.name

        // get file size
        
        var strSize = ""
        if let file = metadata as? Files.FileMetadata {
            let size = file.size
            if size < 1024 {
                strSize = "\(size) Bytes"
            } else if size < 1024*1024 {
                strSize = "\(size/1024) KB"
            } else if size < 1024*1024*1024 {
                strSize = "\(size/1024/1024) MB"
            } else {
                strSize = "\(size/1024/1024/1024) GB"
            }
        }
        cell.attributesLabel.text = strSize
        
        return cell
        
    }
    
}

extension DropboxController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {

        let metadata = files[indexPath.row]
        if let folder = metadata as? Files.FolderMetadata {

            if folder.id == "back" {
                _ = arrPath.popLast()
            } else {
                arrPath.append(folder.name)
            }

            tableView.infiniteScrollingView.startAnimating()
            getFiles()

        } else {

            let title = String(format: "Do you want to download %@?", metadata.name)
            PopupController.showGreen(title, ok: "Download", okCallback: {
                self.downloadFile(file: metadata as! Files.FileMetadata)
            }, cancel: "Cancel", cancelCallback: nil)

        }
    }
    
}
