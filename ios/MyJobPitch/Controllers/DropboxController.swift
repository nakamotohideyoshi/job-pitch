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
    var downloadCallback: ((String) -> Void)!
    
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
        
        let loading = LoadingController()
        loading.addToView(parentView: view)
        loading.view.backgroundColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.5)
        loading.labelView.isHidden = false
        loading.labelView.text = "Downloading..."
        
        let path = "/" + arrPath.joined(separator: "/") + file.name
        let destPath = NSHomeDirectory().appendingFormat("/Documents/%@", file.name.replacingOccurrences(of: " ", with: ""))
        let destURL = URL(fileURLWithPath: destPath)
        let destination: (URL, HTTPURLResponse) -> URL = { temporaryURL, response in
            return destURL
        }
        
        DropboxClientsManager.authorizedClient?.files.download(path: path,
                                                               overwrite: true,
                                                               destination: destination)
            .response { response, error in
                
                loading.view.removeFromSuperview()
                
                if let _ = response {
                    self.dismiss(animated: true, completion: {
                        let path = destURL.absoluteString.replacingOccurrences(of: "file://", with: "")
                        self.downloadCallback?(path)
                    })
                } else if let error = error {
                    print(error)
                    switch error as CallError {
                    case .routeError (let boxed):
                        switch boxed.0.unboxed as Files.DownloadError {
                        case .path (let lookupError):
                            switch lookupError {
                            case .restrictedContent:
                                PopupController.showGreen("The file cannot be downloaded because the content is restricted...",
                                                          ok: nil, okCallback: nil,
                                                          cancel: "OK", cancelCallback: nil)
                            default: break
                            }
                        case .other:
                            print("Unknown")
                        }
                    default: break
                    }
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
                                                          openURL: { (url: URL) -> Void in
                                                            if #available(iOS 10.0, *) {
                                                                UIApplication.shared.open(url, options: [:], completionHandler: nil)
                                                            } else {
                                                                UIApplication.shared.openURL(url)
                                                            }
            })
        
        }
        
    }
    
    @IBAction func cancelAction(_ sender: Any) {
        dismiss(animated: true, completion: nil)
    }
    
    static func instantiate() -> DropboxController {
        return AppHelper.instantiate("Dropbox") as! DropboxController
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
