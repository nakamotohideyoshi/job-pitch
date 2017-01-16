//
//  WebViewController.swift
//  MyJobPitch
//
//  Created by dev on 12/11/17.
//  Copyright © 2017 myjobpitch. All rights reserved.
//

import UIKit

class WebViewController: UIViewController {

    @IBOutlet weak var webView: UIWebView!
    @IBOutlet weak var indicator: UIActivityIndicatorView!
    
    var file: String!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        webView.scrollView.bounces = false
        
        let path = Bundle.main.path(forResource: file, ofType: "html")!
        do {
            let content = try String(contentsOf: URL(fileURLWithPath: path), encoding: .utf8)
            webView.loadHTMLString(content, baseURL: nil)
        } catch {
        }
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
