//
//  WebViewController.swift
//  MyJobPitch
//
//  Created by dev on 12/11/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

class WebViewController: MJPController {

    @IBOutlet weak var webView: UIWebView!
    @IBOutlet weak var indicator: UIActivityIndicatorView!
    
    var file: String!
    var isModal: Bool = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        webView.scrollView.bounces = false
        
        let path = Bundle.main.path(forResource: file, ofType: "html")!
        do {
            let content = try String(contentsOf: URL(fileURLWithPath: path), encoding: .utf8)
            webView.loadHTMLString(content, baseURL: nil)
        } catch {
        }
        
        if isModal == true {
            navigationItem.leftBarButtonItem = UIBarButtonItem(image: UIImage(named: "nav-close"), style: .plain, target: self, action: #selector(closeModal))
        }
        
    }
    
    @IBAction func closeModal() {
        dismiss(animated: true, completion: nil)
    }
    
}

extension WebViewController: UIWebViewDelegate {
    
    public func webViewDidStartLoad(_ webView: UIWebView) {
        indicator.isHidden = false
        indicator.startAnimating()
    }
    
    public func webViewDidFinishLoad(_ webView: UIWebView) {
        indicator.isHidden = true
        indicator.stopAnimating()
    }
}
