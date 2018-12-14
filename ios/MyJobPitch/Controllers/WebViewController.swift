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
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        webView.scrollView.bounces = false
        
        let filename = file + NSLocalizedString("-help-file", comment: "")
        
        let path = Bundle.main.path(forResource: filename, ofType: "html")!
        do {
            let content = try String(contentsOf: URL(fileURLWithPath: path), encoding: .utf8)
            webView.loadHTMLString(content, baseURL: nil)
        } catch {
        }
    }
    
    static func instantiate() -> WebViewController {
        return AppHelper.instantiate("WebView") as! WebViewController
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
