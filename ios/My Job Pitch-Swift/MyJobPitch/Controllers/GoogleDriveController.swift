//
//  GoogleDriveController.swift
//  MyJobPitch
//
//  Created by dev on 6/19/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit
import GoogleAPIClientForREST
import GoogleSignIn
import SVPullToRefresh

class GoogleDriveController: UIViewController, GIDSignInDelegate, GIDSignInUIDelegate {
    
    @IBOutlet weak var tableView: UITableView!

    let service = GTLRDriveService()
    
    var files = [GTLRDrive_File]()
    var arrPath = ["root"]
    
    var nextPageToken: String!
    
    var mimeQuery: String!
    var downloadCallback: ((String) -> Void)!
    
    let ICONS = [
        "application/vnd.google-apps.folder": "g_folder",
        "image/jpeg": "g_image",
        "image/png": "g_image",
        "application/pdf": "g_pdf",
    ]
    
    var loading: LoadingController!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.addPullToRefresh {
            if GIDSignIn.sharedInstance().hasAuthInKeychain() {
                self.getFiles(false)
            } else {
                self.tableView.pullToRefreshView.stopAnimating()
            }
        }
        
        tableView.addInfiniteScrolling {
            if GIDSignIn.sharedInstance().hasAuthInKeychain() && self.nextPageToken != nil {
                self.getFiles(true)
            } else {
                self.tableView.infiniteScrollingView.stopAnimating()
            }
        }
        
        GIDSignIn.sharedInstance().delegate = self
        GIDSignIn.sharedInstance().uiDelegate = self
        GIDSignIn.sharedInstance().scopes = [kGTLRAuthScopeDriveReadonly]
        if GIDSignIn.sharedInstance().hasAuthInKeychain() {
            showLoading("Sign in...")
            GIDSignIn.sharedInstance().signInSilently()
        }
    }
    
    func showLoading(_ label: String!) {
        loading = LoadingController()
        loading.addToView(parentView: view)
        loading.view.backgroundColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.5)
        loading.labelView.isHidden = false
        loading.labelView.text = label
    }
    
    func sign(_ signIn: GIDSignIn!, didSignInFor user: GIDGoogleUser!,
              withError error: Error!) {
        
        loading.view.removeFromSuperview()
        
        if error != nil {
            PopupController.showGreen("Authentication Error",
                                      ok: nil, okCallback: nil,
                                      cancel: "OK", cancelCallback: {
                                        self.dismiss(animated: true, completion: nil)
            })
        } else {
            navigationItem.rightBarButtonItem?.title = "Sign out"
            service.authorizer = user.authentication.fetcherAuthorizer()
            tableView.infiniteScrollingView.startAnimating()
            arrPath = ["root"];
            getFiles(false)
        }
    }
    
    func getFiles(_ next: Bool) {
        if next == false {
            nextPageToken = nil
            files.removeAll()
        }
        
        let query = GTLRDriveQuery_FilesList.query()
        query.pageSize = 20
        var q = "'\(arrPath[arrPath.count-1])' in parents"
        if mimeQuery != nil {
            q = String(format: "%@ and (mimeType = 'application/vnd.google-apps.folder' or %@)", q, mimeQuery)
        }
        query.q = q
        query.orderBy = "folder,name"
        query.fields = "nextPageToken,files(mimeType,id,name,size)"
        query.pageToken = nextPageToken
        service.executeQuery(query) { (ticket, result, error) in
            if error != nil {
                PopupController.showGreen("Error",
                                          ok: nil, okCallback: nil,
                                          cancel: "OK", cancelCallback: nil)
            } else {
                if self.arrPath.count > 1 && self.files.count == 0 {
                    let file = GTLRDrive_File()
                    file.name = ".."
                    file.mimeType = "application/vnd.google-apps.folder"
                    self.files.append(file)
                }
                
                let fileList = result as! GTLRDrive_FileList
                self.nextPageToken = fileList.nextPageToken
                for file in fileList.files! {
                    self.files.append(file)
                }
            }
            
            self.tableView.reloadData()
            self.tableView.pullToRefreshView.stopAnimating()
            self.tableView.infiniteScrollingView.stopAnimating()
        }

    }
    
    func downloadFile(file: GTLRDrive_File) {
        showLoading("Downloading...")
        let query = GTLRDriveQuery_FilesGet.queryForMedia(withFileId: file.identifier!)
        service.executeQuery(query) { (ticket, result, error) in
            self.loading.view.removeFromSuperview()
            if error == nil {
                let object = result as! GTLRDataObject
                let path = NSHomeDirectory().appendingFormat("/Documents/%@", file.name!.replacingOccurrences(of: " ", with: ""))
                do {
                    try object.data.write(to: URL(fileURLWithPath: path))
                    self.dismiss(animated: true, completion: {
                        self.downloadCallback?(path)
                    })
                    return
                } catch {
                }
            }
            
            PopupController.showGreen("Failed to download " + file.name!,
                                      ok: nil, okCallback: nil,
                                      cancel: "OK", cancelCallback: nil)
        }
    }

    @IBAction func signAction(_ sender: Any) {
        if GIDSignIn.sharedInstance().hasAuthInKeychain() {
            GIDSignIn.sharedInstance().signOut()
            navigationItem.rightBarButtonItem?.title = "Sign in"
            files.removeAll()
            tableView.reloadData()
        } else {
            GIDSignIn.sharedInstance().signIn()
        }
    }
    
    @IBAction func cancelAction(_ sender: Any) {
        dismiss(animated: true, completion: nil)
    }
    
    static func instantiate() -> GoogleDriveController {
        return AppHelper.instantiate("GoogleDrive") as! GoogleDriveController
    }

}

extension GoogleDriveController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return files.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "FileCell", for: indexPath) as! FileCell
        
        if (files.count > indexPath.row) {
            
            let file = files[indexPath.row]
            
            // get icon
            if let iconName = ICONS[file.mimeType!] {
                cell.imgView.image = UIImage(named: iconName)
            } else {
                cell.imgView.image = UIImage(named: "g_file")
            }
            
            // get folder/file name
            
            cell.nameLabel?.text = file.name
            
            // get file size
            
            if let size = file.size?.int64Value {
                if size < 1024 {
                    cell.attributesLabel.text = "\(size) Bytes"
                } else if size < 1024*1024 {
                    cell.attributesLabel.text = "\(size/1024) KB"
                } else if size < 1024*1024*1024 {
                    cell.attributesLabel.text = "\(size/1024/1024) MB"
                } else {
                    cell.attributesLabel.text = "\(size/1024/1024/1024) GB"
                }
            } else {
                cell.attributesLabel.text = ""
            }
            
        }
        
        return cell
        
    }
    
}

extension GoogleDriveController: UITableViewDelegate {
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let file = files[indexPath.row]
        if file.mimeType == "application/vnd.google-apps.folder" {
            if file.identifier == nil {
                _ = arrPath.popLast()
            } else {
                arrPath.append(file.identifier!)
            }
            getFiles(false)
            tableView.reloadData()
            tableView.infiniteScrollingView.startAnimating()            
        } else {
            if file.size != nil {
                let title = String(format: "Do you want to download %@?", file.name!)
                PopupController.showGreen(title, ok: "Download", okCallback: {
                    self.downloadFile(file: file)
                }, cancel: "Cancel", cancelCallback: nil)
            }            
        }
    }
    
}
