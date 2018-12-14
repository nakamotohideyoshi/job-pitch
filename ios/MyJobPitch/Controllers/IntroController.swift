//
//  OnboardingController.swift
//  ReportedPD
//
//  Created by dev on 12/29/16.
//  Copyright © 2016 reported. All rights reserved.
//

import UIKit

class IntroController: UIViewController {
    
    @IBOutlet weak var scrollView: UIScrollView!
    @IBOutlet weak var pageControl: UIPageControl!
    @IBOutlet weak var readyButton: GreenButton!
    @IBOutlet weak var skipButton: UIButton!
    @IBOutlet weak var logoContainer: UIView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        logoContainer.layer.cornerRadius = UIScreen.main.bounds.width / 4
    }
    
    @IBAction func readyAction(_ sender: Any) {
        
        if pageControl.currentPage < 3 {
            let x = (pageControl.currentPage+1) * Int(UIScreen.main.bounds.size.width)
            let currentPage = x / Int(UIScreen.main.bounds.size.width)
            if currentPage != pageControl.currentPage {
                scrollView.setContentOffset(CGPoint(x: x, y: 0), animated: true)
            }
            return
        }
        
        SideMenuController.pushController(id: "view_profile")
        
    }

    @IBAction func skipAction(_ sender: Any) {
        SideMenuController.pushController(id: "view_profile")
    }
    
}

extension IntroController: UIScrollViewDelegate {
    
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let currentPage = pageControl.currentPage
        pageControl.currentPage = Int(scrollView.contentOffset.x) / Int(UIScreen.main.bounds.size.width)
        if currentPage != pageControl.currentPage {
            readyButton.setTitle(pageControl.currentPage == 3 ? NSLocalizedString("I'm ready", comment: "") : NSLocalizedString("Next", comment: ""), for: .normal)
            skipButton.isHidden = pageControl.currentPage == 3
        }
    }
    
}
