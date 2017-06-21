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
    
    var signoutButton: UIBarButtonItem!
    var folderIconLink: String!
    
    var files = [GTLRDrive_File]()
    var arrPath = ["root"]
    
    var nextPageToken: String!
    
    var mimeQuery: String!
    var downloadCallback: ((String, String) -> Void)!
    
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
            GIDSignIn.sharedInstance().signInSilently()
        }
    }
    
    override func viewDidAppear(_ animated: Bool) {

    }
    
    func sign(_ signIn: GIDSignIn!, didSignInFor user: GIDGoogleUser!,
              withError error: Error!) {
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
        query.fields = "nextPageToken,files(mimeType,id,name,iconLink,size)"
        query.pageToken = nextPageToken
        service.executeQuery(query) { (ticket, result, error) in
            if error != nil {
                PopupController.showGreen("Error",
                                          ok: nil, okCallback: nil,
                                          cancel: "OK", cancelCallback: nil)
                return
            }
            
            if self.arrPath.count > 1 && self.files.count == 0 {
                let file = GTLRDrive_File()
                file.name = ".."
                file.iconLink = self.folderIconLink
                file.mimeType = "application/vnd.google-apps.folder"
                self.files.append(file)
            }
            
            let fileList = result as! GTLRDrive_FileList
            self.nextPageToken = fileList.nextPageToken
            for file in fileList.files! {
                self.files.append(file)
            }
            self.tableView.reloadData()
            self.tableView.pullToRefreshView.stopAnimating()
            self.tableView.infiniteScrollingView.stopAnimating()
        }

    }
    
    func downloadFile(file: GTLRDrive_File) {
        AppHelper.showLoading("Downloading...")
        let query = GTLRDriveQuery_FilesGet.queryForMedia(withFileId: file.identifier!)
        service.executeQuery(query) { (ticket, result, error) in
            AppHelper.hideLoading()
            if error == nil {
                let object = result as! GTLRDataObject
                let path = NSHomeDirectory().appendingFormat("/Documents/%@", file.name!)
                do {
                    try object.data.write(to: URL(fileURLWithPath: path))
                    self.dismiss(animated: true, completion: {
                        self.downloadCallback?(path, file.name!)
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

}

extension GoogleDriveController: UITableViewDataSource {
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return files.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "FileCell", for: indexPath) as! FileCell
        
        let file = files[indexPath.row]
        cell.nameLabel?.text = file.name
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
        AppHelper.loadImageURL(imageUrl: file.thumbnailLink != nil ? file.thumbnailLink! : file.iconLink!,
                               imageView: cell.imgView!,
                               completion: nil)
        
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
                if folderIconLink == nil {
                    folderIconLink = file.iconLink
                }
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
